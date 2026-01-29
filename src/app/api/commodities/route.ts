/**
 * 원자재 시세 조회 API
 *
 * 한국투자증권 API를 통해 원자재 ETF 가격을 조회하고,
 * 선물 가격으로 변환하여 제공합니다.
 *
 * ============================================================
 * 지원 원자재 및 ETF 매핑:
 * ============================================================
 * - Gold: GLD ETF × 10.12 ≈ 금 선물 가격 (1 GLD = 0.0988 oz)
 * - Silver: SLV ETF × 1.08 ≈ 은 선물 가격 (1 SLV ≈ 1 oz)
 * - Crude Oil (WTI): USO ETF 기반 추정
 * - Natural Gas: UNG ETF 기반 추정
 * - Copper: CPER ETF 기반 추정
 * - Platinum: PPLT ETF × 10 ≈ 백금 선물 가격
 *
 * ============================================================
 * API 엔드포인트:
 * ============================================================
 * GET /api/commodities
 *
 * 응답 예시:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "gold", "name": "Gold", "symbol": "GC=F", "price": 5070.50, ... }
 *   ],
 *   "timestamp": "2026-01-29T12:00:00.000Z"
 * }
 */

import { NextResponse } from 'next/server';
import { getOverseasStockPrice } from '@/lib/kis-api';

// ==================== 타입 정의 ====================

/** 원자재 데이터 타입 */
interface CommodityData {
  /** 고유 ID */
  id: string;
  /** 원자재 이름 */
  name: string;
  /** 선물 심볼 (표시용) */
  symbol: string;
  /** 현재 가격 (선물 가격 추정치) */
  price: number;
  /** 전일 대비 변동 */
  change: number;
  /** 전일 대비 변동률 (%) */
  changePercent: number;
  /** 단위 */
  unit: string;
  /** 차트 데이터 (최근 가격 추이) */
  chartData: number[];
  /** ETF 심볼 (데이터 소스) */
  etfSymbol: string;
}

/** API 응답 타입 */
interface CommoditiesResponse {
  success: boolean;
  data: CommodityData[] | null;
  error?: string;
  timestamp: string;
  source: 'api' | 'fallback';
}

// ==================== 원자재 설정 ====================

/**
 * 원자재 ETF 매핑 설정
 *
 * ETF 가격을 선물 가격으로 변환하기 위한 계수를 포함합니다.
 */
const COMMODITY_ETF_CONFIG = [
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'GC=F',
    unit: '/oz',
    etfSymbol: 'GLD',
    exchange: 'AMS' as const,
    // GLD ETF 1주 = 약 0.0978 온스 금
    // GLD $496 → Gold 선물 ~$5,070 → multiplier ≈ 10.22
    multiplier: 10.22,
  },
  {
    id: 'silver',
    name: 'Silver',
    symbol: 'SI=F',
    unit: '/oz',
    etfSymbol: 'SLV',
    exchange: 'AMS' as const,
    // SLV ETF는 은 가격의 약 3.5배
    // SLV $105.65 → Silver 선물 ~$30 → multiplier ≈ 0.284
    multiplier: 0.284,
  },
  {
    id: 'oil',
    name: 'Crude Oil (WTI)',
    symbol: 'CL=F',
    unit: '/bbl',
    etfSymbol: 'DBO',
    exchange: 'AMS' as const,
    // DBO (Invesco DB Oil Fund) 사용 - USO보다 안정적
    // DBO $13.95 → WTI 선물 ~$74 → multiplier ≈ 5.3
    multiplier: 5.3,
  },
  {
    id: 'brent',
    name: 'Brent Crude',
    symbol: 'BZ=F',
    unit: '/bbl',
    etfSymbol: 'BNO',
    exchange: 'AMS' as const,
    // BNO $32.79 → Brent 선물 ~$78 → multiplier ≈ 2.38
    multiplier: 2.38,
  },
  {
    id: 'copper',
    name: 'Copper',
    symbol: 'HG=F',
    unit: '/lb',
    etfSymbol: 'CPER',
    exchange: 'AMS' as const,
    // CPER $38.50 → Copper 선물 ~$4.25 → multiplier ≈ 0.11
    multiplier: 0.11,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    symbol: 'PL=F',
    unit: '/oz',
    etfSymbol: 'PPLT',
    exchange: 'AMS' as const,
    // PPLT $239 → Platinum 선물 ~$980 → multiplier ≈ 4.1
    multiplier: 4.1,
  },
] as const;

// ==================== Fallback 데이터 ====================

/**
 * API 실패 시 사용할 기본 데이터
 * (최근 시세 기준 - 주기적으로 업데이트 필요)
 */
const FALLBACK_DATA: CommodityData[] = [
  { id: 'gold', name: 'Gold', symbol: 'GC=F', price: 5070.00, change: 15.00, changePercent: 0.30, unit: '/oz', chartData: [5040, 5050, 5055, 5060, 5065, 5068, 5069, 5070, 5070], etfSymbol: 'GLD' },
  { id: 'silver', name: 'Silver', symbol: 'SI=F', price: 30.00, change: -0.20, changePercent: -0.65, unit: '/oz', chartData: [30.5, 30.4, 30.3, 30.2, 30.1, 30.05, 30.02, 30, 30], etfSymbol: 'SLV' },
  { id: 'oil', name: 'Crude Oil (WTI)', symbol: 'CL=F', price: 74.00, change: 0.80, changePercent: 1.08, unit: '/bbl', chartData: [73, 73.3, 73.5, 73.7, 73.8, 73.9, 73.95, 74, 74], etfSymbol: 'DBO' },
  { id: 'brent', name: 'Brent Crude', symbol: 'BZ=F', price: 78.00, change: 0.65, changePercent: 0.84, unit: '/bbl', chartData: [77, 77.3, 77.5, 77.7, 77.8, 77.9, 77.95, 78, 78], etfSymbol: 'BNO' },
  { id: 'copper', name: 'Copper', symbol: 'HG=F', price: 4.25, change: 0.08, changePercent: 1.92, unit: '/lb', chartData: [4.15, 4.17, 4.19, 4.2, 4.22, 4.23, 4.24, 4.25, 4.25], etfSymbol: 'CPER' },
  { id: 'platinum', name: 'Platinum', symbol: 'PL=F', price: 980.00, change: -5.00, changePercent: -0.51, unit: '/oz', chartData: [985, 984, 983, 982, 981, 980, 980, 980, 980], etfSymbol: 'PPLT' },
];

// ==================== 유틸리티 함수 ====================

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
    data.push(Math.round(price * 100) / 100);
  }

  return data;
}

// ==================== API 핸들러 ====================

/**
 * GET /api/commodities
 *
 * 원자재 시세를 조회합니다.
 * 한국투자증권 API로 ETF 가격을 조회하고 선물 가격으로 변환합니다.
 */
export async function GET(): Promise<NextResponse<CommoditiesResponse>> {
  try {
    console.log('[Commodities API] 원자재 시세 조회 시작');

    // 병렬로 모든 ETF 가격 조회
    const etfPromises = COMMODITY_ETF_CONFIG.map(async (config) => {
      try {
        const priceData = await getOverseasStockPrice(config.exchange, config.etfSymbol);

        // ETF 가격을 선물 가격으로 변환
        const futuresPrice = priceData.currentPrice * config.multiplier;
        const futuresChange = priceData.change * config.multiplier;

        return {
          id: config.id,
          name: config.name,
          symbol: config.symbol,
          price: Math.round(futuresPrice * 100) / 100,
          change: Math.round(futuresChange * 100) / 100,
          changePercent: priceData.changePercent,
          unit: config.unit,
          chartData: generateChartData(futuresPrice, priceData.changePercent),
          etfSymbol: config.etfSymbol,
          success: true,
        };
      } catch (error) {
        console.warn(`[Commodities API] ${config.etfSymbol} 조회 실패:`, error);
        return {
          ...config,
          price: 0,
          change: 0,
          changePercent: 0,
          chartData: [0],
          success: false,
        };
      }
    });

    const results = await Promise.all(etfPromises);

    // 성공한 데이터 필터링
    const successfulData = results.filter(r => r.success);
    const failedCount = results.length - successfulData.length;

    if (successfulData.length === 0) {
      // 모든 API 호출 실패 시 fallback 데이터 사용
      console.warn('[Commodities API] 모든 ETF 조회 실패, fallback 데이터 사용');
      return NextResponse.json({
        success: true,
        data: FALLBACK_DATA,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      });
    }

    // 실패한 항목은 fallback 데이터로 대체
    const commodities: CommodityData[] = results.map(result => {
      if (result.success) {
        return {
          id: result.id,
          name: result.name,
          symbol: result.symbol,
          price: result.price,
          change: result.change,
          changePercent: result.changePercent,
          unit: result.unit,
          chartData: result.chartData,
          etfSymbol: result.etfSymbol,
        };
      } else {
        // Fallback 데이터에서 찾기
        const fallback = FALLBACK_DATA.find(f => f.id === result.id);
        return fallback || {
          id: result.id,
          name: result.name,
          symbol: result.symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          unit: result.unit,
          chartData: [0],
          etfSymbol: result.etfSymbol,
        };
      }
    });

    console.log('[Commodities API] 조회 완료:',
      commodities.map(c => ({ name: c.name, price: c.price, etf: c.etfSymbol }))
    );

    if (failedCount > 0) {
      console.warn(`[Commodities API] ${failedCount}개 항목 fallback 사용`);
    }

    return NextResponse.json({
      success: true,
      data: commodities,
      timestamp: new Date().toISOString(),
      source: 'api',
    });
  } catch (error) {
    console.error('[Commodities API] 오류:', error);

    // 전체 실패 시 fallback 데이터 반환
    return NextResponse.json({
      success: true,
      data: FALLBACK_DATA,
      error: error instanceof Error ? error.message : '원자재 시세 조회 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      source: 'fallback',
    });
  }
}
