/**
 * 해외주식 시가총액순위 조회 API Route
 *
 * @route GET /api/kis/overseas/ranking/market-cap
 * @query exchange - 거래소코드 (NAS: 나스닥, NYS: 뉴욕, AMS: 아멕스)
 *
 * @description
 * 한국투자증권 Open API를 통해 해외주식 시가총액 순위를 조회합니다.
 *
 * 사용 예시:
 * - GET /api/kis/overseas/ranking/market-cap (기본: 나스닥)
 * - GET /api/kis/overseas/ranking/market-cap?exchange=NYS (뉴욕)
 * - GET /api/kis/overseas/ranking/market-cap?exchange=NAS (나스닥)
 *
 * @see https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/market_cap
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOverseasMarketCapRanking } from '@/lib/kis-api';
import type { OverseasMarketCapRankingData, OverseasExchangeCode, KISApiErrorResponse } from '@/types/kis';

/**
 * 유효한 미국 거래소 코드
 */
const VALID_US_EXCHANGES: OverseasExchangeCode[] = ['NAS', 'NYS', 'AMS'];

/**
 * API 응답 타입
 */
interface OverseasMarketCapRankingResponse {
  /** 시가총액순위 데이터 */
  data: OverseasMarketCapRankingData[];
  /** 거래소 코드 */
  exchange: OverseasExchangeCode;
  /** 조회 시각 */
  timestamp: string;
}

/**
 * GET /api/kis/overseas/ranking/market-cap
 *
 * @param request NextRequest 객체
 * @returns 시가총액순위 데이터 또는 에러
 */
export async function GET(request: NextRequest): Promise<NextResponse<OverseasMarketCapRankingResponse | KISApiErrorResponse>> {
  // 쿼리 파라미터에서 거래소 추출
  const searchParams = request.nextUrl.searchParams;
  const exchangeParam = searchParams.get('exchange') || 'NAS';

  // 거래소 코드 검증
  if (!VALID_US_EXCHANGES.includes(exchangeParam as OverseasExchangeCode)) {
    return NextResponse.json(
      {
        error: 'INVALID_EXCHANGE',
        message: `유효하지 않은 거래소 코드입니다. 사용 가능: ${VALID_US_EXCHANGES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  const exchange = exchangeParam as OverseasExchangeCode;

  try {
    console.log(`[API /api/kis/overseas/ranking/market-cap] ${exchange} 시가총액순위 조회 시작`);

    const data = await getOverseasMarketCapRanking(exchange);

    console.log(`[API] 조회 완료: ${data.length}개 종목`);

    return NextResponse.json({
      data,
      exchange,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /api/kis/overseas/ranking/market-cap] 에러:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    // API 키 미설정 에러
    if (errorMessage.includes('API 키가 설정되지 않았습니다')) {
      return NextResponse.json(
        {
          error: 'API_KEY_NOT_CONFIGURED',
          message: errorMessage,
        },
        { status: 500 }
      );
    }

    // 인증 에러
    if (errorMessage.includes('인증') || errorMessage.includes('토큰')) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_ERROR',
          message: errorMessage,
        },
        { status: 401 }
      );
    }

    // 기타 에러
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
