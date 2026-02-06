/**
 * 푸시 알림 발송 API
 *
 * FCM을 통해 사용자에게 푸시 알림을 발송합니다.
 *
 * ============================================================
 * 엔드포인트: POST /api/notifications/send-push
 * ============================================================
 *
 * 요청 본문:
 * {
 *   userId: string;          // 대상 사용자 UID
 *   title: string;           // 알림 제목
 *   body: string;            // 알림 본문
 *   data?: {                 // 추가 데이터 (선택)
 *     ticker?: string;       // 종목 코드
 *     market?: string;       // 시장 구분 (KR/US)
 *     alertId?: string;      // 알림 ID
 *   };
 * }
 *
 * 응답:
 * - 200: 발송 성공 { success: true, sentCount: number }
 * - 400: 잘못된 요청
 * - 500: 서버 에러
 *
 * ============================================================
 * 보안:
 * ============================================================
 * - 이 API는 내부에서만 호출해야 합니다
 * - Cron Job 또는 서버사이드에서만 호출
 * - 클라이언트에서 직접 호출하면 안 됩니다
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminDb } from '@/lib/firebase-admin';

/**
 * 요청 본문 타입
 */
interface SendPushRequest {
  userId: string;
  title: string;
  body: string;
  data?: {
    ticker?: string;
    market?: string;
    alertId?: string;
    [key: string]: string | undefined;
  };
}

/**
 * POST /api/notifications/send-push
 *
 * 특정 사용자에게 푸시 알림을 발송합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body: SendPushRequest = await request.json();

    // 필수 필드 검증
    if (!body.userId || !body.title || !body.body) {
      return NextResponse.json(
        { success: false, error: 'userId, title, body는 필수입니다.' },
        { status: 400 }
      );
    }

    console.log('[SendPush] 푸시 발송 요청:', {
      userId: body.userId,
      title: body.title,
    });

    // 사용자의 FCM 토큰 조회
    const tokensSnapshot = await adminDb
      .collection('users')
      .doc(body.userId)
      .collection('fcmTokens')
      .get();

    if (tokensSnapshot.empty) {
      console.log('[SendPush] FCM 토큰 없음:', body.userId);
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: 'FCM 토큰이 없습니다.',
      });
    }

    // 모든 토큰 추출
    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      console.log('[SendPush] 유효한 토큰 없음:', body.userId);
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: '유효한 FCM 토큰이 없습니다.',
      });
    }

    console.log('[SendPush] 토큰 수:', tokens.length);

    // FCM 메시지 구성
    // data 필드의 undefined 값을 빈 문자열로 변환
    const cleanData: Record<string, string> = {};
    if (body.data) {
      Object.entries(body.data).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });
    }

    const message = {
      notification: {
        title: body.title,
        body: body.body,
      },
      data: cleanData,
      // 웹 푸시 설정
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          requireInteraction: true,
          vibrate: [200, 100, 200] as number[],
        },
        fcmOptions: {
          link: body.data?.ticker && body.data?.market
            ? `/market/${body.data.ticker}?market=${body.data.market.toLowerCase()}`
            : '/alerts',
        },
      },
      tokens,
    };

    // FCM 멀티캐스트 발송
    const response = await adminMessaging.sendEachForMulticast(message);

    console.log('[SendPush] 발송 결과:', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    // 실패한 토큰 처리 (만료/무효 토큰 삭제)
    if (response.failureCount > 0) {
      const tokensToDelete: string[] = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          // 만료되거나 무효한 토큰인 경우 삭제 대상에 추가
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            tokensToDelete.push(tokens[index]);
          }
          console.error('[SendPush] 발송 실패:', {
            token: tokens[index].substring(0, 20) + '...',
            error: resp.error.message,
            code: errorCode,
          });
        }
      });

      // 무효한 토큰 삭제
      if (tokensToDelete.length > 0) {
        console.log('[SendPush] 무효한 토큰 삭제:', tokensToDelete.length);
        // 비동기로 삭제 (응답 대기하지 않음)
        deleteInvalidTokens(body.userId, tokensSnapshot.docs, tokensToDelete);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failedCount: response.failureCount,
    });
  } catch (error) {
    console.error('[SendPush] 에러:', error);
    return NextResponse.json(
      { success: false, error: '푸시 알림 발송에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 무효한 FCM 토큰 삭제
 *
 * @param userId - 사용자 UID
 * @param docs - Firestore 문서 목록
 * @param invalidTokens - 삭제할 토큰 목록
 */
async function deleteInvalidTokens(
  userId: string,
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  invalidTokens: string[]
): Promise<void> {
  const batch = adminDb.batch();

  docs.forEach((doc) => {
    const data = doc.data();
    if (invalidTokens.includes(data.token)) {
      batch.delete(doc.ref);
    }
  });

  try {
    await batch.commit();
    console.log('[SendPush] 무효한 토큰 삭제 완료');
  } catch (error) {
    console.error('[SendPush] 토큰 삭제 실패:', error);
  }
}
