/**
 * ETF 구성종목 조회 API
 *
 * GET /api/etf/holdings?symbol=QQQ
 *
 * Firestore에서 ETF 구성종목 데이터를 조회합니다.
 *
 * 쿼리 파라미터:
 * - symbol: ETF 심볼 (필수) - 예: QQQ, SPY, VOO
 *
 * 응답:
 * - 200: ETF 구성종목 데이터
 * - 400: 잘못된 요청 (symbol 누락)
 * - 404: ETF 데이터 없음
 * - 500: 서버 오류
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDoc } from 'firebase/firestore';
import { etfHoldingsDoc } from '@/lib/firestore';

// ==================== 타입 정의 ====================

/**
 * ETF 구성종목 개별 아이템
 */
export interface ETFHolding {
  /** 종목 심볼 */
  symbol: string;
  /** 종목명 */
  name: string;
  /** 비중 (%) */
  weight: number;
}

/**
 * ETF 구성종목 문서 전체
 */
export interface ETFHoldingsData {
  /** ETF 심볼 */
  symbol: string;
  /** ETF 이름 */
  name: string;
  /** 한글 설명 */
  description: string;
  /** 구성종목 배열 (비중 순) */
  holdings: ETFHolding[];
  /** 전체 구성종목 수 */
  totalHoldings: number;
  /** 마지막 업데이트 날짜 */
  updatedAt: string;
}

// ==================== GET 핸들러 ====================

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터에서 symbol 추출
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();

    // symbol 파라미터 검증
    if (!symbol) {
      return NextResponse.json(
        { error: 'symbol 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // Firestore에서 ETF 구성종목 조회
    const docRef = etfHoldingsDoc(symbol);
    const docSnap = await getDoc(docRef);

    // 문서가 존재하지 않으면 404
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: `${symbol} ETF의 구성종목 데이터가 없습니다.` },
        { status: 404 }
      );
    }

    // 데이터 반환
    const data = docSnap.data() as ETFHoldingsData;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[ETF Holdings API] 오류:', error);
    return NextResponse.json(
      { error: 'ETF 구성종목 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
