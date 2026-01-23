/**
 * Finnhub 미국 주식 실시간 시세 조회 API Route
 *
 * @route GET /api/finnhub/quote
 * @query symbol - 미국 종목 심볼 (예: AAPL, MSFT, GOOGL)
 *
 * @description
 * Finnhub API를 통해 미국 주식의 실시간 시세를 조회합니다.
 * 무료 플랜에서는 미국 주식만 지원됩니다.
 *
 * 사용 예시:
 * - GET /api/finnhub/quote?symbol=AAPL (애플)
 * - GET /api/finnhub/quote?symbol=MSFT (마이크로소프트)
 * - GET /api/finnhub/quote?symbol=GOOGL (알파벳/구글)
 * - GET /api/finnhub/quote?symbol=TSLA (테슬라)
 *
 * @see https://finnhub.io/docs/api/quote
 */

import { NextRequest, NextResponse } from 'next/server';

/** Finnhub Quote API 응답 타입 */
interface FinnhubQuoteResponse {
  c: number;   // 현재가 (current price)
  d: number;   // 변동액 (change)
  dp: number;  // 변동률 % (percent change)
  h: number;   // 당일 고가 (high)
  l: number;   // 당일 저가 (low)
  o: number;   // 시가 (open)
  pc: number;  // 전일 종가 (previous close)
  t: number;   // 타임스탬프 (timestamp)
}

/** 정제된 시세 응답 타입 */
interface StockQuoteData {
  symbol: string;           // 종목 심볼
  currentPrice: number;     // 현재가
  change: number;           // 변동액
  changePercent: number;    // 변동률 (%)
  highPrice: number;        // 당일 고가
  lowPrice: number;         // 당일 저가
  openPrice: number;        // 시가
  previousClose: number;    // 전일 종가
  timestamp: number;        // 타임스탬프
  market: 'US';             // 시장 구분
}

/** 에러 응답 타입 */
interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * 미국 주식 심볼인지 판별하는 함수
 *
 * @param symbol 종목 심볼
 * @returns 알파벳으로만 구성되어 있으면 true (미국 주식)
 *
 * @example
 * isUSStock('AAPL')   // true - 애플
 * isUSStock('005930') // false - 삼성전자 (한국)
 * isUSStock('BRK.A')  // false - 버크셔해서웨이 (점 포함)
 */
export function isUSStock(symbol: string): boolean {
  // 알파벳으로만 구성된 심볼은 미국 주식으로 판단
  // 참고: 일부 미국 주식은 BRK.A, BRK.B처럼 점이 포함될 수 있음
  return /^[A-Za-z]+$/.test(symbol);
}

/**
 * GET /api/finnhub/quote
 *
 * Finnhub API를 통해 미국 주식 실시간 시세를 조회합니다.
 *
 * @param request NextRequest 객체
 * @returns 주식 시세 정보 또는 에러
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<StockQuoteData | ErrorResponse>> {
  // 쿼리 파라미터에서 종목 심볼 추출
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  // 심볼 필수 검사
  if (!symbol) {
    return NextResponse.json(
      {
        error: 'MISSING_SYMBOL',
        message: '종목 심볼(symbol)을 입력해주세요. 예: ?symbol=AAPL',
      },
      { status: 400 }
    );
  }

  // 심볼을 대문자로 변환
  const upperSymbol = symbol.toUpperCase();

  // 미국 주식 심볼 형식 검사 (알파벳 1~5자)
  if (!/^[A-Z]{1,5}$/.test(upperSymbol)) {
    return NextResponse.json(
      {
        error: 'INVALID_SYMBOL',
        message:
          '미국 주식 심볼은 1~5자의 알파벳이어야 합니다. 예: AAPL, MSFT, GOOGL',
      },
      { status: 400 }
    );
  }

  // Finnhub API 키 확인
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.error('[API /api/finnhub/quote] FINNHUB_API_KEY가 설정되지 않았습니다.');
    return NextResponse.json(
      {
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'Finnhub API 키가 설정되지 않았습니다.',
      },
      { status: 500 }
    );
  }

  try {
    // Finnhub Quote API 호출
    const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${apiKey}`;

    const response = await fetch(finnhubUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 캐시를 사용하지 않음 (실시간 데이터)
      cache: 'no-store',
    });

    // HTTP 에러 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API /api/finnhub/quote] Finnhub API 에러:', response.status, errorText);

      return NextResponse.json(
        {
          error: 'FINNHUB_API_ERROR',
          message: `Finnhub API 호출 실패: ${response.status} ${response.statusText}`,
        },
        { status: 502 }
      );
    }

    // 응답 JSON 파싱
    const data: FinnhubQuoteResponse = await response.json();

    // 유효하지 않은 심볼 체크 (Finnhub은 존재하지 않는 심볼에 대해 0을 반환)
    if (data.c === 0 && data.pc === 0 && data.t === 0) {
      return NextResponse.json(
        {
          error: 'SYMBOL_NOT_FOUND',
          message: `종목 심볼 '${upperSymbol}'을(를) 찾을 수 없습니다. 올바른 미국 주식 심볼인지 확인해주세요.`,
        },
        { status: 404 }
      );
    }

    // 정제된 응답 데이터 생성
    const stockQuote: StockQuoteData = {
      symbol: upperSymbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      highPrice: data.h,
      lowPrice: data.l,
      openPrice: data.o,
      previousClose: data.pc,
      timestamp: data.t,
      market: 'US',
    };

    // 성공 응답 반환
    return NextResponse.json(stockQuote);

  } catch (error) {
    console.error('[API /api/finnhub/quote] 에러:', error);

    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
