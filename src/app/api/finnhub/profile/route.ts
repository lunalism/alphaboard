/**
 * Finnhub 미국 주식 회사 정보 조회 API Route
 *
 * @route GET /api/finnhub/profile
 * @query symbol - 미국 종목 심볼 (예: AAPL, MSFT, GOOGL)
 *
 * @description
 * Finnhub API를 통해 미국 주식의 회사 프로필 정보를 조회합니다.
 * 회사명, 산업, 시가총액, 웹사이트, 로고 등의 정보를 제공합니다.
 *
 * 사용 예시:
 * - GET /api/finnhub/profile?symbol=AAPL (애플)
 * - GET /api/finnhub/profile?symbol=MSFT (마이크로소프트)
 * - GET /api/finnhub/profile?symbol=GOOGL (알파벳/구글)
 *
 * @see https://finnhub.io/docs/api/company-profile2
 */

import { NextRequest, NextResponse } from 'next/server';

/** Finnhub Company Profile2 API 응답 타입 */
interface FinnhubProfileResponse {
  country: string;              // 국가 (예: "US")
  currency: string;             // 통화 (예: "USD")
  exchange: string;             // 거래소 (예: "NASDAQ NMS - GLOBAL MARKET")
  finnhubIndustry: string;      // 산업 분류 (예: "Technology")
  ipo: string;                  // IPO 날짜 (예: "1980-12-12")
  logo: string;                 // 로고 URL
  marketCapitalization: number; // 시가총액 (백만 단위)
  name: string;                 // 회사명 (예: "Apple Inc")
  phone: string;                // 전화번호
  shareOutstanding: number;     // 발행주식수 (백만 단위)
  ticker: string;               // 티커 심볼 (예: "AAPL")
  weburl: string;               // 웹사이트 URL
}

/** 정제된 회사 프로필 응답 타입 */
interface CompanyProfileData {
  symbol: string;           // 종목 심볼
  name: string;             // 회사명
  country: string;          // 국가
  currency: string;         // 통화
  exchange: string;         // 거래소
  industry: string;         // 산업 분류
  ipoDate: string;          // IPO 날짜
  logo: string;             // 로고 URL
  marketCap: number;        // 시가총액 (백만 달러)
  sharesOutstanding: number;// 발행주식수 (백만)
  website: string;          // 웹사이트 URL
  market: 'US';             // 시장 구분
}

/** 에러 응답 타입 */
interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * GET /api/finnhub/profile
 *
 * Finnhub API를 통해 미국 주식의 회사 프로필을 조회합니다.
 *
 * @param request NextRequest 객체
 * @returns 회사 프로필 정보 또는 에러
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CompanyProfileData | ErrorResponse>> {
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
    console.error('[API /api/finnhub/profile] FINNHUB_API_KEY가 설정되지 않았습니다.');
    return NextResponse.json(
      {
        error: 'API_KEY_NOT_CONFIGURED',
        message: 'Finnhub API 키가 설정되지 않았습니다.',
      },
      { status: 500 }
    );
  }

  try {
    // Finnhub Company Profile2 API 호출
    const finnhubUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${apiKey}`;

    const response = await fetch(finnhubUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 회사 정보는 자주 변경되지 않으므로 1시간 캐시
      next: { revalidate: 3600 },
    });

    // HTTP 에러 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API /api/finnhub/profile] Finnhub API 에러:', response.status, errorText);

      return NextResponse.json(
        {
          error: 'FINNHUB_API_ERROR',
          message: `Finnhub API 호출 실패: ${response.status} ${response.statusText}`,
        },
        { status: 502 }
      );
    }

    // 응답 JSON 파싱
    const data: FinnhubProfileResponse = await response.json();

    // 유효하지 않은 심볼 체크 (Finnhub은 존재하지 않는 심볼에 대해 빈 객체를 반환)
    if (!data.name || !data.ticker) {
      return NextResponse.json(
        {
          error: 'SYMBOL_NOT_FOUND',
          message: `종목 심볼 '${upperSymbol}'을(를) 찾을 수 없습니다. 올바른 미국 주식 심볼인지 확인해주세요.`,
        },
        { status: 404 }
      );
    }

    // 정제된 응답 데이터 생성
    const companyProfile: CompanyProfileData = {
      symbol: data.ticker,
      name: data.name,
      country: data.country,
      currency: data.currency,
      exchange: data.exchange,
      industry: data.finnhubIndustry,
      ipoDate: data.ipo,
      logo: data.logo,
      marketCap: data.marketCapitalization,
      sharesOutstanding: data.shareOutstanding,
      website: data.weburl,
      market: 'US',
    };

    // 성공 응답 반환
    return NextResponse.json(companyProfile);

  } catch (error) {
    console.error('[API /api/finnhub/profile] 에러:', error);

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
