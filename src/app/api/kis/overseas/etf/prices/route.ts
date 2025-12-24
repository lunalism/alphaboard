/**
 * 미국 ETF 시세 일괄 조회 API Route
 *
 * @route GET /api/kis/overseas/etf/prices
 * @query category - ETF 카테고리 (선택: index, sector, leveraged, bond, commodity, international, all)
 *
 * @description
 * 한국투자증권 Open API를 통해 여러 미국 ETF의 현재가를 일괄 조회합니다.
 *
 * 사용 예시:
 * - GET /api/kis/overseas/etf/prices (전체 ETF 조회)
 * - GET /api/kis/overseas/etf/prices?category=index (지수 추종 ETF만 조회)
 * - GET /api/kis/overseas/etf/prices?category=sector (섹터/테마 ETF만 조회)
 * - GET /api/kis/overseas/etf/prices?category=leveraged (레버리지/인버스 ETF만 조회)
 *
 * Rate Limit 고려사항:
 * - 한국투자증권 API는 초당 20회 제한이 있음
 * - 30개 ETF를 병렬 조회하면 약 2초 소요 예상
 * - 요청 간 적절한 딜레이를 추가하여 안정성 확보
 *
 * @see https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/price
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOverseasStockPrice } from '@/lib/kis-api';
import { usETFList, getUSETFsByCategory, USETFInfo } from '@/constants';
import type { OverseasStockPriceData, KISApiErrorResponse, OverseasExchangeCode } from '@/types/kis';

/**
 * 미국 ETF 시세 데이터 타입 (클라이언트용)
 */
export interface USETFPriceData extends OverseasStockPriceData {
  /** ETF 이름 */
  name: string;
  /** ETF 카테고리 */
  category: USETFInfo['category'];
  /** 운용사 */
  issuer: string;
}

/**
 * API 응답 타입
 */
interface USETFPricesResponse {
  /** 조회 성공한 ETF 목록 */
  data: USETFPriceData[];
  /** 조회 실패한 ETF 목록 (종목코드) */
  failed: string[];
  /** 조회 시각 */
  timestamp: string;
  /** 조회한 카테고리 */
  category: string;
}

/**
 * 단일 ETF 시세 조회 (에러 처리 포함)
 */
async function fetchUSETFPrice(etfInfo: USETFInfo): Promise<USETFPriceData | null> {
  try {
    const priceData = await getOverseasStockPrice(
      etfInfo.exchange as OverseasExchangeCode,
      etfInfo.symbol
    );

    return {
      ...priceData,
      name: etfInfo.name,
      category: etfInfo.category,
      issuer: etfInfo.issuer,
    };
  } catch (error) {
    console.error(`[US ETF API] ${etfInfo.symbol} (${etfInfo.name}) 조회 실패:`, error);
    return null;
  }
}

/**
 * 배열을 청크로 분할
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 딜레이 함수
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * GET /api/kis/overseas/etf/prices
 */
export async function GET(request: NextRequest): Promise<NextResponse<USETFPricesResponse | KISApiErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'all';

  try {
    // 카테고리에 따라 ETF 목록 필터링
    let targetETFs: USETFInfo[];

    if (category === 'all') {
      targetETFs = usETFList;
    } else {
      // 레버리지/인버스 ETF 카테고리 추가
      const validCategories = ['index', 'sector', 'leveraged', 'bond', 'commodity', 'international'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          {
            error: 'INVALID_CATEGORY',
            message: `유효하지 않은 카테고리입니다. 사용 가능: ${validCategories.join(', ')}, all`,
          },
          { status: 400 }
        );
      }
      targetETFs = getUSETFsByCategory(category as USETFInfo['category']);
    }

    console.log(`[US ETF API] ${category} 카테고리 ${targetETFs.length}개 ETF 조회 시작`);

    // 병렬 조회 (Rate Limit 고려)
    // 10개씩 청크로 나누어 병렬 조회 후 150ms 대기
    const results: (USETFPriceData | null)[] = [];
    const chunks = chunkArray(targetETFs, 10);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const chunkResults = await Promise.all(
        chunk.map(etf => fetchUSETFPrice(etf))
      );

      results.push(...chunkResults);

      // 마지막 청크가 아니면 딜레이 추가
      if (i < chunks.length - 1) {
        await delay(150);
      }
    }

    // 성공한 결과와 실패한 종목 분리
    const successfulData: USETFPriceData[] = [];
    const failedSymbols: string[] = [];

    results.forEach((result, index) => {
      if (result) {
        successfulData.push(result);
      } else {
        failedSymbols.push(targetETFs[index].symbol);
      }
    });

    console.log(`[US ETF API] 조회 완료: 성공 ${successfulData.length}개, 실패 ${failedSymbols.length}개`);

    return NextResponse.json({
      data: successfulData,
      failed: failedSymbols,
      timestamp: new Date().toISOString(),
      category,
    });
  } catch (error) {
    console.error('[API /api/kis/overseas/etf/prices] 에러:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    if (errorMessage.includes('API 키가 설정되지 않았습니다')) {
      return NextResponse.json(
        {
          error: 'API_KEY_NOT_CONFIGURED',
          message: errorMessage,
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('인증') || errorMessage.includes('토큰')) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_ERROR',
          message: errorMessage,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
