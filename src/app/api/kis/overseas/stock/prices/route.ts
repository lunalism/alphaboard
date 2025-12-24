/**
 * 미국 주식 시세 일괄 조회 API Route
 *
 * @route GET /api/kis/overseas/stock/prices
 * @query sector - 섹터 필터 (선택: tech, finance, healthcare, consumer, energy, industrial, telecom, all)
 *
 * @description
 * 한국투자증권 Open API를 통해 미국 시가총액 상위 주식의 현재가를 일괄 조회합니다.
 * 해외주식 시가총액순위 API가 빈 배열을 반환하는 경우의 폴백으로 사용됩니다.
 *
 * 사용 예시:
 * - GET /api/kis/overseas/stock/prices (전체 주식 조회)
 * - GET /api/kis/overseas/stock/prices?sector=tech (기술 섹터만 조회)
 *
 * @see https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/price
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOverseasStockPrice } from '@/lib/kis-api';
import { usStockList, USStockInfo } from '@/constants';
import type { OverseasStockPriceData, KISApiErrorResponse, OverseasExchangeCode } from '@/types/kis';

/**
 * 미국 주식 시세 데이터 타입 (클라이언트용)
 */
export interface USStockPriceData extends OverseasStockPriceData {
  /** 회사명 */
  name: string;
  /** 섹터 */
  sector: USStockInfo['sector'];
}

/**
 * API 응답 타입
 */
interface USStockPricesResponse {
  /** 조회 성공한 주식 목록 */
  data: USStockPriceData[];
  /** 조회 실패한 주식 목록 (종목코드) */
  failed: string[];
  /** 조회 시각 */
  timestamp: string;
  /** 조회한 섹터 */
  sector: string;
}

/**
 * 단일 주식 시세 조회 (에러 처리 포함)
 */
async function fetchUSStockPrice(stockInfo: USStockInfo): Promise<USStockPriceData | null> {
  try {
    const priceData = await getOverseasStockPrice(
      stockInfo.exchange as OverseasExchangeCode,
      stockInfo.symbol
    );

    return {
      ...priceData,
      name: stockInfo.name,
      sector: stockInfo.sector,
    };
  } catch (error) {
    console.error(`[US Stock API] ${stockInfo.symbol} (${stockInfo.name}) 조회 실패:`, error);
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
 * GET /api/kis/overseas/stock/prices
 */
export async function GET(request: NextRequest): Promise<NextResponse<USStockPricesResponse | KISApiErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const sector = searchParams.get('sector') || 'all';

  try {
    // 섹터에 따라 주식 목록 필터링
    let targetStocks: USStockInfo[];

    if (sector === 'all') {
      targetStocks = usStockList;
    } else {
      const validSectors = ['tech', 'finance', 'healthcare', 'consumer', 'energy', 'industrial', 'telecom', 'materials', 'utilities', 'realestate'];
      if (!validSectors.includes(sector)) {
        return NextResponse.json(
          {
            error: 'INVALID_SECTOR',
            message: `유효하지 않은 섹터입니다. 사용 가능: ${validSectors.join(', ')}, all`,
          },
          { status: 400 }
        );
      }
      targetStocks = usStockList.filter(stock => stock.sector === sector);
    }

    console.log(`[US Stock API] ${sector} 섹터 ${targetStocks.length}개 주식 조회 시작`);

    // 병렬 조회 (Rate Limit 고려)
    // 10개씩 청크로 나누어 병렬 조회 후 150ms 대기
    const results: (USStockPriceData | null)[] = [];
    const chunks = chunkArray(targetStocks, 10);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const chunkResults = await Promise.all(
        chunk.map(stock => fetchUSStockPrice(stock))
      );

      results.push(...chunkResults);

      // 마지막 청크가 아니면 딜레이 추가
      if (i < chunks.length - 1) {
        await delay(150);
      }
    }

    // 성공한 결과와 실패한 종목 분리
    const successfulData: USStockPriceData[] = [];
    const failedSymbols: string[] = [];

    results.forEach((result, index) => {
      if (result) {
        successfulData.push(result);
      } else {
        failedSymbols.push(targetStocks[index].symbol);
      }
    });

    // 가격 기준으로 정렬 (시가총액 순 대용)
    successfulData.sort((a, b) => b.currentPrice - a.currentPrice);

    console.log(`[US Stock API] 조회 완료: 성공 ${successfulData.length}개, 실패 ${failedSymbols.length}개`);

    return NextResponse.json({
      data: successfulData,
      failed: failedSymbols,
      timestamp: new Date().toISOString(),
      sector,
    });
  } catch (error) {
    console.error('[API /api/kis/overseas/stock/prices] 에러:', error);

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
