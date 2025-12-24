/**
 * 등락률순위 조회 API Route
 *
 * @route GET /api/kis/ranking/fluctuation
 * @query market - 시장구분 ('all' | 'kospi' | 'kosdaq', 기본값: 'all')
 * @query sort - 정렬순서 ('asc': 상승률순, 'desc': 하락률순, 기본값: 'asc')
 *
 * @description
 * 한국투자증권 Open API를 통해 등락률순위를 조회합니다.
 * 한국투자 HTS(eFriend Plus) > [0170] 등락률 순위 화면의 기능을 API로 개발한 사항
 * 최대 30건 확인 가능, 다음 조회 불가
 *
 * 사용 예시:
 * - GET /api/kis/ranking/fluctuation (상승률 상위)
 * - GET /api/kis/ranking/fluctuation?sort=desc (하락률 상위)
 * - GET /api/kis/ranking/fluctuation?market=kospi (코스피 상승률)
 * - GET /api/kis/ranking/fluctuation?market=kosdaq&sort=desc (코스닥 하락률)
 *
 * API 세부사항:
 * - 엔드포인트: /uapi/domestic-stock/v1/ranking/fluctuation
 * - tr_id: FHPST01700000
 *
 * @see https://apiportal.koreainvestment.com/apiservice/apiservice-domestic-stock-ranking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFluctuationRanking } from '@/lib/kis-api';
import type { FluctuationRankingData, KISApiErrorResponse } from '@/types/kis';

/**
 * GET /api/kis/ranking/fluctuation
 *
 * @param request NextRequest 객체
 * @returns 등락률순위 데이터 (최대 30건) 또는 에러
 */
export async function GET(request: NextRequest): Promise<NextResponse<FluctuationRankingData[] | KISApiErrorResponse>> {
  // 쿼리 파라미터 추출
  const searchParams = request.nextUrl.searchParams;
  const marketParam = searchParams.get('market') || 'all';
  const sortParam = searchParams.get('sort') || 'asc';

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

  // 유효한 정렬순서인지 확인
  if (!['asc', 'desc'].includes(sortParam)) {
    return NextResponse.json(
      {
        error: 'INVALID_SORT',
        message: '유효하지 않은 정렬순서입니다. asc(상승률순) 또는 desc(하락률순)를 입력해주세요.',
      },
      { status: 400 }
    );
  }

  const market = marketParam as 'all' | 'kospi' | 'kosdaq';
  const sortOrder = sortParam as 'asc' | 'desc';

  try {
    // 한국투자증권 API 호출
    const fluctuationRanking = await getFluctuationRanking(market, sortOrder);

    // 성공 응답
    return NextResponse.json(fluctuationRanking);
  } catch (error) {
    console.error('[API /api/kis/ranking/fluctuation] 에러:', error);

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
