/**
 * 시가총액순위 조회 API Route
 *
 * @route GET /api/kis/ranking/market-cap
 * @query market - 시장구분 ('all' | 'kospi' | 'kosdaq', 기본값: 'all')
 *
 * @description
 * 한국투자증권 Open API를 통해 시가총액순위를 조회합니다.
 * 한국투자 HTS(eFriend Plus) > [0174] 시가총액 상위 화면의 기능을 API로 개발한 사항
 * 최대 30건 확인 가능, 다음 조회 불가
 *
 * 사용 예시:
 * - GET /api/kis/ranking/market-cap (전체 시장)
 * - GET /api/kis/ranking/market-cap?market=kospi (코스피)
 * - GET /api/kis/ranking/market-cap?market=kosdaq (코스닥)
 *
 * API 세부사항:
 * - 엔드포인트: /uapi/domestic-stock/v1/quotations/market-cap
 * - tr_id: FHPST01740000
 *
 * @see https://apiportal.koreainvestment.com/apiservice/apiservice-domestic-stock-ranking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketCapRanking } from '@/lib/kis-api';
import type { MarketCapRankingData, KISApiErrorResponse } from '@/types/kis';

/**
 * GET /api/kis/ranking/market-cap
 *
 * @param request NextRequest 객체
 * @returns 시가총액순위 데이터 (최대 30건) 또는 에러
 */
export async function GET(request: NextRequest): Promise<NextResponse<MarketCapRankingData[] | KISApiErrorResponse>> {
  // 쿼리 파라미터에서 시장구분 추출
  const searchParams = request.nextUrl.searchParams;
  const marketParam = searchParams.get('market') || 'all';

  // 유효한 시장구분인지 확인
  if (!['all', 'kospi', 'kosdaq'].includes(marketParam)) {
    return NextResponse.json(
      {
        error: 'INVALID_MARKET',
        message: '유효하지 않은 시장구분입니다. all, kospi, kosdaq 중 하나를 입력해주세요.',
      },
      { status: 400 }
    );
  }

  const market = marketParam as 'all' | 'kospi' | 'kosdaq';

  try {
    // 한국투자증권 API 호출
    const marketCapRanking = await getMarketCapRanking(market);

    // 성공 응답
    return NextResponse.json(marketCapRanking);
  } catch (error) {
    console.error('[API /api/kis/ranking/market-cap] 에러:', error);

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

    // 한국투자증권 API 에러
    if (errorMessage.includes('API 에러')) {
      return NextResponse.json(
        {
          error: 'KIS_API_ERROR',
          message: errorMessage,
        },
        { status: 502 }
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
