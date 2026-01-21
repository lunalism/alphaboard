/**
 * 가격 알림 API 라우트 (Firestore)
 *
 * 가격 알림 목록 조회 및 새 알림 추가 API
 *
 * 엔드포인트:
 * - GET /api/alerts: 내 알림 목록 조회
 * - POST /api/alerts: 새 알림 추가
 *
 * 인증:
 * - x-user-id 헤더로 사용자 인증
 *
 * Firestore 구조:
 * price_alerts/{alertId}
 *   - userId: string
 *   - ticker: string
 *   - market: string (KR/US)
 *   - stockName: string
 *   - targetPrice: number
 *   - direction: string (above/below)
 *   - isActive: boolean
 *   - isTriggered: boolean
 *   - createdAt: timestamp
 *   - triggeredAt: timestamp | null
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  alertsCollection,
  queryCollection,
  timestampToString,
  where,
  addDoc,
  serverTimestamp,
  type FirestoreAlert,
} from '@/lib/firestore';
import {
  PriceAlert,
  CreateAlertRequest,
  AlertMarket,
  AlertDirection,
} from '@/types/priceAlert';

/**
 * Firestore 문서를 PriceAlert로 변환
 */
function docToAlert(doc: FirestoreAlert & { id: string }): PriceAlert {
  return {
    id: doc.id,
    userId: doc.userId,
    ticker: doc.ticker,
    market: doc.market as AlertMarket,
    stockName: doc.stockName,
    targetPrice: doc.targetPrice,
    direction: doc.direction as AlertDirection,
    isActive: doc.isActive,
    isTriggered: doc.isTriggered,
    createdAt: timestampToString(doc.createdAt),
    triggeredAt: doc.triggeredAt ? timestampToString(doc.triggeredAt) : undefined,
  };
}

/**
 * GET /api/alerts
 *
 * 현재 로그인한 사용자의 가격 알림 목록 조회
 *
 * @returns 알림 목록 또는 에러
 */
export async function GET(request: NextRequest) {
  console.log('[Alerts API] GET /api/alerts 요청 시작');

  try {
    // 요청 헤더에서 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id');
    console.log('[Alerts API] userId:', userId);

    // 인증 에러 체크
    if (!userId) {
      console.log('[Alerts API] userId 없음 - 401 반환');
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    console.log('[Alerts API] Firestore 쿼리 시작...');

    // 알림 목록 조회
    // 주의: where + orderBy 조합은 Firestore 복합 인덱스 필요
    // 인덱스 없이 작동하도록 where만 사용 후 JavaScript에서 정렬
    const alerts = await queryCollection<FirestoreAlert>(
      alertsCollection(),
      [
        where('userId', '==', userId),
        // orderBy는 인덱스 필요하므로 제거, 아래에서 JavaScript로 정렬
      ]
    );

    console.log('[Alerts API] Firestore 쿼리 완료, 결과 수:', alerts.length);

    // JavaScript에서 최신순 정렬 (createdAt 내림차순)
    alerts.sort((a, b) => {
      // Firestore Timestamp 객체 처리
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime(); // 내림차순 (최신순)
    });

    // Firestore 문서를 PriceAlert로 변환
    const priceAlerts = alerts.map((doc, index) => {
      try {
        return docToAlert(doc);
      } catch (convertError) {
        console.error(`[Alerts API] 문서 변환 에러 (index: ${index}, id: ${doc.id}):`, convertError);
        console.error('[Alerts API] 문제 문서 데이터:', JSON.stringify(doc, null, 2));
        throw convertError;
      }
    });

    console.log('[Alerts API] 변환 완료, 반환 알림 수:', priceAlerts.length);
    return NextResponse.json({ success: true, data: priceAlerts });
  } catch (error) {
    // 상세 에러 로깅
    console.error('[Alerts API] ===== 알림 조회 에러 =====');
    console.error('[Alerts API] 에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Alerts API] 에러 메시지:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('[Alerts API] 스택 트레이스:', error.stack);
    }

    // Firestore 에러인 경우 추가 정보 출력
    const firestoreError = error as { code?: string; details?: string };
    if (firestoreError.code) {
      console.error('[Alerts API] Firestore 에러 코드:', firestoreError.code);
    }
    if (firestoreError.details) {
      console.error('[Alerts API] Firestore 에러 상세:', firestoreError.details);
    }

    return NextResponse.json(
      {
        success: false,
        error: '서버 에러가 발생했습니다',
        // 개발 환경에서만 상세 에러 반환
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 *
 * 새 가격 알림 추가
 *
 * @param request 요청 객체 (본문에 알림 정보 포함)
 * @returns 생성된 알림 또는 에러
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 헤더에서 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id');

    // 인증 에러 체크
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body: CreateAlertRequest = await request.json();

    // 필수 필드 검증
    if (!body.ticker || !body.market || !body.stockName || !body.targetPrice || !body.direction) {
      return NextResponse.json(
        { success: false, error: '필수 항목이 누락되었습니다' },
        { status: 400 }
      );
    }

    // 시장 유효성 검증
    if (!['KR', 'US'].includes(body.market)) {
      return NextResponse.json(
        { success: false, error: '잘못된 시장 구분입니다' },
        { status: 400 }
      );
    }

    // 방향 유효성 검증
    if (!['above', 'below'].includes(body.direction)) {
      return NextResponse.json(
        { success: false, error: '잘못된 알림 방향입니다' },
        { status: 400 }
      );
    }

    // 목표가 유효성 검증
    if (body.targetPrice <= 0) {
      return NextResponse.json(
        { success: false, error: '목표가는 0보다 커야 합니다' },
        { status: 400 }
      );
    }

    // Firestore에 알림 추가
    const alertData = {
      userId,
      ticker: body.ticker,
      market: body.market,
      stockName: body.stockName,
      targetPrice: body.targetPrice,
      direction: body.direction,
      isActive: true,
      isTriggered: false,
      createdAt: serverTimestamp(),
      triggeredAt: null,
    };

    const docRef = await addDoc(alertsCollection(), alertData);

    // 생성된 알림 반환
    const createdAlert: PriceAlert = {
      id: docRef.id,
      userId,
      ticker: body.ticker,
      market: body.market as AlertMarket,
      stockName: body.stockName,
      targetPrice: body.targetPrice,
      direction: body.direction as AlertDirection,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toISOString(),
      triggeredAt: undefined,
    };

    return NextResponse.json({ success: true, data: createdAlert }, { status: 201 });
  } catch (error) {
    console.error('[Alerts API] 알림 추가 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
