/**
 * 암호화폐 시세 조회 API
 *
 * CoinGecko API를 통해 주요 암호화폐 가격을 조회합니다.
 *
 * ============================================================
 * 지원 암호화폐:
 * ============================================================
 * - Bitcoin (BTC)
 * - Ethereum (ETH)
 * - Solana (SOL)
 * - XRP
 * - Cardano (ADA)
 * - Dogecoin (DOGE)
 * - Avalanche (AVAX)
 * - Chainlink (LINK)
 *
 * ============================================================
 * API 엔드포인트:
 * ============================================================
 * GET /api/crypto
 *
 * 응답 예시:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "btc", "name": "Bitcoin", "symbol": "BTC", "price": 87800, ... }
 *   ],
 *   "timestamp": "2026-01-29T12:00:00.000Z"
 * }
 */

import { NextResponse } from 'next/server';

// ==================== 타입 정의 ====================

/** 암호화폐 데이터 타입 */
interface CryptoData {
  /** 고유 ID */
  id: string;
  /** 암호화폐 이름 */
  name: string;
  /** 심볼 (BTC, ETH 등) */
  symbol: string;
  /** 현재 가격 (USD) */
  price: number;
  /** 24시간 변동 (USD) */
  change24h: number;
  /** 24시간 변동률 (%) */
  changePercent24h: number;
  /** 시가총액 (포맷된 문자열) */
  marketCap: string;
  /** 24시간 거래량 (포맷된 문자열) */
  volume24h: string;
  /** 아이콘 */
  icon: string;
  /** 차트 데이터 */
  chartData: number[];
}

/** API 응답 타입 */
interface CryptoAPIResponse {
  success: boolean;
  data: CryptoData[] | null;
  error?: string;
  timestamp: string;
  source: 'api' | 'fallback';
}

/** CoinGecko API 응답 타입 */
interface CoinGeckoPrice {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
  usd_24h_change: number;
}

interface CoinGeckoResponse {
  [key: string]: CoinGeckoPrice;
}

// ==================== 암호화폐 설정 ====================

/**
 * 암호화폐 설정
 *
 * CoinGecko ID와 표시 정보를 매핑합니다.
 */
const CRYPTO_CONFIG = [
  { id: 'btc', coingeckoId: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'eth', coingeckoId: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { id: 'sol', coingeckoId: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎' },
  { id: 'xrp', coingeckoId: 'ripple', name: 'XRP', symbol: 'XRP', icon: '✕' },
  { id: 'ada', coingeckoId: 'cardano', name: 'Cardano', symbol: 'ADA', icon: '₳' },
  { id: 'doge', coingeckoId: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð' },
  { id: 'avax', coingeckoId: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', icon: '🔺' },
  { id: 'link', coingeckoId: 'chainlink', name: 'Chainlink', symbol: 'LINK', icon: '⬡' },
] as const;

// ==================== Fallback 데이터 ====================

/**
 * API 실패 시 사용할 기본 데이터
 * (최근 시세 기준 - CoinGecko API 실패 시 사용)
 */
const FALLBACK_DATA: CryptoData[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 87800, change24h: -1500, changePercent24h: -1.68, marketCap: '$1.74T', volume24h: '$45B', icon: '₿', chartData: [89000, 88500, 88200, 88000, 87800, 87700, 87750, 87800, 87800] },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 2900, change24h: -80, changePercent24h: -2.68, marketCap: '$350B', volume24h: '$18B', icon: 'Ξ', chartData: [2980, 2960, 2940, 2920, 2910, 2905, 2902, 2900, 2900] },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 120, change24h: -5, changePercent24h: -4.0, marketCap: '$58B', volume24h: '$5B', icon: '◎', chartData: [125, 124, 123, 122, 121, 120.5, 120.2, 120, 120] },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 1.86, change24h: -0.08, changePercent24h: -4.12, marketCap: '$107B', volume24h: '$4B', icon: '✕', chartData: [1.94, 1.92, 1.90, 1.88, 1.87, 1.86, 1.86, 1.86, 1.86] },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.35, change24h: -0.02, changePercent24h: -5.41, marketCap: '$12B', volume24h: '$600M', icon: '₳', chartData: [0.37, 0.365, 0.36, 0.355, 0.352, 0.35, 0.35, 0.35, 0.35] },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.12, change24h: -0.008, changePercent24h: -6.25, marketCap: '$17B', volume24h: '$1.5B', icon: 'Ð', chartData: [0.128, 0.126, 0.124, 0.122, 0.121, 0.12, 0.12, 0.12, 0.12] },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', price: 11.5, change24h: -0.8, changePercent24h: -6.5, marketCap: '$4.5B', volume24h: '$450M', icon: '🔺', chartData: [12.3, 12.1, 11.9, 11.7, 11.6, 11.55, 11.52, 11.5, 11.5] },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', price: 11.5, change24h: -0.7, changePercent24h: -5.74, marketCap: '$7B', volume24h: '$500M', icon: '⬡', chartData: [12.2, 12, 11.8, 11.6, 11.55, 11.52, 11.5, 11.5, 11.5] },
];

// ==================== 유틸리티 함수 ====================

/**
 * 숫자를 포맷된 문자열로 변환
 *
 * @param value - 변환할 숫자
 * @returns 포맷된 문자열 (예: "$1.74T", "$45.2B", "$892M")
 */
function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(0)}M`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * 차트 데이터 생성
 *
 * 현재 가격과 변동률을 기반으로 추세 데이터를 생성합니다.
 *
 * @param currentPrice - 현재 가격
 * @param changePercent - 변동률 (%)
 * @returns 9개 포인트의 차트 데이터
 */
function generateChartData(currentPrice: number, changePercent: number): number[] {
  const points = 9;
  const data: number[] = [];

  // 변동률 기반 추세 생성
  const trend = changePercent / 100;
  const volatility = Math.abs(trend) * 0.3;

  for (let i = 0; i < points; i++) {
    // 과거(0)에서 현재(8)로 갈수록 현재 가격에 수렴
    const progress = i / (points - 1);
    const baseChange = trend * (1 - progress);
    const noise = (Math.random() - 0.5) * volatility * (1 - progress);
    const price = currentPrice * (1 - baseChange + noise);

    // 가격에 따른 소수점 자릿수 결정
    if (currentPrice >= 1000) {
      data.push(Math.round(price));
    } else if (currentPrice >= 1) {
      data.push(Math.round(price * 100) / 100);
    } else {
      data.push(Math.round(price * 10000) / 10000);
    }
  }

  return data;
}

// ==================== API 핸들러 ====================

/**
 * GET /api/crypto
 *
 * CoinGecko API를 통해 암호화폐 시세를 조회합니다.
 */
export async function GET(): Promise<NextResponse<CryptoAPIResponse>> {
  try {
    console.log('[Crypto API] 암호화폐 시세 조회 시작');

    // CoinGecko API 호출
    const coingeckoIds = CRYPTO_CONFIG.map(c => c.coingeckoId).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // 캐시 비활성화: 항상 최신 데이터 요청
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API 오류: ${response.status} ${response.statusText}`);
    }

    const coinGeckoData = await response.json() as CoinGeckoResponse;

    console.log('[Crypto API] CoinGecko 응답:', Object.keys(coinGeckoData));

    // 응답 데이터 변환
    const cryptoList: CryptoData[] = CRYPTO_CONFIG.map(config => {
      const coinData = coinGeckoData[config.coingeckoId];

      if (coinData) {
        const price = coinData.usd;
        const changePercent = coinData.usd_24h_change;
        // 24시간 전 가격 계산: 현재가격 / (1 + 변동률/100)
        const previousPrice = price / (1 + changePercent / 100);
        const change24h = price - previousPrice;

        return {
          id: config.id,
          name: config.name,
          symbol: config.symbol,
          price: price,
          change24h: Math.round(change24h * 100) / 100,
          changePercent24h: Math.round(changePercent * 100) / 100,
          marketCap: formatLargeNumber(coinData.usd_market_cap),
          volume24h: formatLargeNumber(coinData.usd_24h_vol),
          icon: config.icon,
          chartData: generateChartData(price, changePercent),
        };
      } else {
        // 데이터 없는 경우 fallback에서 찾기
        const fallback = FALLBACK_DATA.find(f => f.id === config.id);
        return fallback || {
          id: config.id,
          name: config.name,
          symbol: config.symbol,
          price: 0,
          change24h: 0,
          changePercent24h: 0,
          marketCap: '$0',
          volume24h: '$0',
          icon: config.icon,
          chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
      }
    });

    console.log('[Crypto API] 조회 완료:',
      cryptoList.map(c => ({ symbol: c.symbol, price: c.price }))
    );

    return NextResponse.json({
      success: true,
      data: cryptoList,
      timestamp: new Date().toISOString(),
      source: 'api',
    });
  } catch (error) {
    console.error('[Crypto API] 오류:', error);

    // API 실패 시 fallback 데이터 반환
    return NextResponse.json({
      success: true,
      data: FALLBACK_DATA,
      error: error instanceof Error ? error.message : '암호화폐 시세 조회 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      source: 'fallback',
    });
  }
}
