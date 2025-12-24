/**
 * 해외지수 시세 조회 API Route
 *
 * @route GET /api/kis/overseas/indices
 *
 * @description
 * 한국투자증권 Open API를 통해 미국 주요 지수(S&P500, NASDAQ, DOW JONES)의
 * 현재가를 조회합니다.
 *
 * 사용 예시:
 * - GET /api/kis/overseas/indices (모든 지수 조회)
 *
 * @see https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/inquire_time_indexchartprice
 */

import { NextResponse } from 'next/server';
import { getOverseasIndexPrice } from '@/lib/kis-api';
import type { OverseasIndexData, OverseasIndexCode, KISApiErrorResponse } from '@/types/kis';

/**
 * 조회할 미국 주요 지수 목록
 */
const US_INDICES: OverseasIndexCode[] = ['SPX', 'CCMP', 'INDU'];

/**
 * API 응답 타입
 */
interface OverseasIndicesResponse {
  /** 조회된 지수 데이터 */
  data: OverseasIndexData[];
  /** 조회 실패한 지수 */
  failed: OverseasIndexCode[];
  /** 조회 시각 */
  timestamp: string;
}

/**
 * GET /api/kis/overseas/indices
 *
 * @returns 미국 주요 지수 시세 또는 에러
 */
export async function GET(): Promise<NextResponse<OverseasIndicesResponse | KISApiErrorResponse>> {
  try {
    console.log('[API /api/kis/overseas/indices] 미국 지수 조회 시작');

    // 모든 지수를 병렬로 조회
    const results = await Promise.allSettled(
      US_INDICES.map(indexCode => getOverseasIndexPrice(indexCode))
    );

    // 성공/실패 분리
    const successfulData: OverseasIndexData[] = [];
    const failedIndices: OverseasIndexCode[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulData.push(result.value);
      } else {
        failedIndices.push(US_INDICES[index]);
        console.error(`[API] ${US_INDICES[index]} 조회 실패:`, result.reason);
      }
    });

    console.log(`[API] 조회 완료: 성공 ${successfulData.length}개, 실패 ${failedIndices.length}개`);

    return NextResponse.json({
      data: successfulData,
      failed: failedIndices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API /api/kis/overseas/indices] 에러:', error);

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
