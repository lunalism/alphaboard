/**
 * 미국 주식 개별 시세 조회 API Route
 *
 * @route GET /api/kis/overseas/stock/price
 * @query symbol - 종목 심볼 (필수: AAPL, MSFT, GOOGL 등)
 *
 * @description
 * 한국투자증권 Open API를 통해 미국 개별 주식의 현재가를 조회합니다.
 * 관심종목 페이지에서 미국 주식 시세 표시에 사용됩니다.
 *
 * 사용 예시:
 * - GET /api/kis/overseas/stock/price?symbol=AAPL
 * - GET /api/kis/overseas/stock/price?symbol=MSFT
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOverseasStockPrice } from '@/lib/kis-api';
import { usStockList } from '@/constants';
import type { OverseasExchangeCode, KISApiErrorResponse } from '@/types/kis';

/**
 * API 응답 타입
 */
interface USStockPriceResponse {
  /** 종목 심볼 */
  symbol: string;
  /** 회사명 */
  name: string;
  /** 거래소 코드 */
  exchange: string;
  /** 현재가 (USD) */
  currentPrice: number;
  /** 전일 대비 변동폭 */
  change: number;
  /** 전일 대비 변동률 (%) */
  changePercent: number;
  /** 거래량 */
  volume: number;
  /** 조회 시각 */
  timestamp: string;
}

/**
 * GET /api/kis/overseas/stock/price
 */
export async function GET(request: NextRequest): Promise<NextResponse<USStockPriceResponse | KISApiErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol')?.toUpperCase();

  if (!symbol) {
    return NextResponse.json(
      {
        error: 'MISSING_SYMBOL',
        message: '종목 심볼(symbol)이 필요합니다.',
      },
      { status: 400 }
    );
  }

  try {
    // usStockList에서 종목 정보 찾기
    const stockInfo = usStockList.find(stock => stock.symbol === symbol);

    // 목록에 없는 종목은 기본 NAS로 시도
    const exchange: OverseasExchangeCode = stockInfo?.exchange || 'NAS';
    const name = stockInfo?.name || symbol;

    console.log(`[US Stock Price API] ${symbol} (${exchange}) 조회`);

    const priceData = await getOverseasStockPrice(exchange, symbol);

    return NextResponse.json({
      symbol,
      name,
      exchange,
      currentPrice: priceData.currentPrice,
      change: priceData.change,
      changePercent: priceData.changePercent,
      volume: priceData.volume,
      timestamp: priceData.timestamp,
    });
  } catch (error) {
    console.error(`[API /api/kis/overseas/stock/price] ${symbol} 에러:`, error);

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
