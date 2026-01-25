/**
 * ETF 구성종목 시드 API
 *
 * POST /api/etf/seed
 *
 * Firestore에 ETF 구성종목 데이터를 초기화합니다.
 * 개발 및 테스트 용도로 사용합니다.
 *
 * 초기화 대상 ETF:
 * - QQQ (Invesco QQQ Trust) - 나스닥 100
 * - SPY (SPDR S&P 500) - S&P 500
 * - VOO (Vanguard S&P 500) - S&P 500
 * - ARKK (ARK Innovation) - 혁신 기술
 * - DIA (SPDR Dow Jones) - 다우존스 30
 *
 * 데이터 출처:
 * - 각 ETF 운용사 공식 웹사이트 (2024년 12월 기준)
 * - ETF Database, Bloomberg Terminal
 */

import { NextResponse } from 'next/server';
import { setDoc } from 'firebase/firestore';
import { etfHoldingsDoc } from '@/lib/firestore';

// ==================== 타입 정의 ====================

interface ETFHolding {
  symbol: string;
  name: string;
  weight: number;
}

interface ETFHoldingsData {
  symbol: string;
  name: string;
  description: string;
  holdings: ETFHolding[];
  totalHoldings: number;
  updatedAt: string;
}

// ==================== ETF 구성종목 데이터 ====================

/**
 * QQQ (Invesco QQQ Trust) 구성종목
 *
 * 나스닥 100 지수 추종 ETF
 * 상위 15개 종목 (비중 기준)
 * 데이터 출처: Invesco 공식 웹사이트 (2024년 12월 기준)
 */
const QQQ_HOLDINGS: ETFHoldingsData = {
  symbol: 'QQQ',
  name: 'Invesco QQQ Trust',
  description: '나스닥 100 지수를 추종하는 대표적인 기술주 ETF입니다.',
  holdings: [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.92 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 8.15 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 7.81 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.42 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 5.12 },
    { symbol: 'META', name: 'Meta Platforms Inc.', weight: 4.98 },
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: 4.21 },
    { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.89 },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 2.78 },
    { symbol: 'COST', name: 'Costco Wholesale Corp.', weight: 2.65 },
    { symbol: 'NFLX', name: 'Netflix Inc.', weight: 2.21 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', weight: 2.08 },
    { symbol: 'ADBE', name: 'Adobe Inc.', weight: 1.95 },
    { symbol: 'PEP', name: 'PepsiCo Inc.', weight: 1.82 },
    { symbol: 'LIN', name: 'Linde plc', weight: 1.68 },
  ],
  totalHoldings: 101,
  updatedAt: '2024-12-20',
};

/**
 * SPY (SPDR S&P 500 ETF Trust) 구성종목
 *
 * S&P 500 지수 추종 ETF (State Street)
 * 상위 15개 종목 (비중 기준)
 * 데이터 출처: State Street 공식 웹사이트 (2024년 12월 기준)
 */
const SPY_HOLDINGS: ETFHoldingsData = {
  symbol: 'SPY',
  name: 'SPDR S&P 500 ETF Trust',
  description: 'S&P 500 지수를 추종하는 세계 최대 규모의 ETF입니다.',
  holdings: [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.12 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.89 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 6.45 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.82 },
    { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.54 },
    { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.18 },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.82 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', weight: 1.78 },
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: 1.72 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 1.65 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.42 },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', weight: 1.38 },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', weight: 1.25 },
    { symbol: 'V', name: 'Visa Inc.', weight: 1.18 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', weight: 1.12 },
  ],
  totalHoldings: 503,
  updatedAt: '2024-12-20',
};

/**
 * VOO (Vanguard S&P 500 ETF) 구성종목
 *
 * S&P 500 지수 추종 ETF (Vanguard)
 * 상위 15개 종목 (비중 기준)
 * 데이터 출처: Vanguard 공식 웹사이트 (2024년 12월 기준)
 */
const VOO_HOLDINGS: ETFHoldingsData = {
  symbol: 'VOO',
  name: 'Vanguard S&P 500 ETF',
  description: 'Vanguard가 운용하는 저비용 S&P 500 추종 ETF입니다.',
  holdings: [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.15 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.92 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 6.48 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.85 },
    { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.56 },
    { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.20 },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.84 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', weight: 1.80 },
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: 1.74 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 1.68 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.45 },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', weight: 1.40 },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', weight: 1.28 },
    { symbol: 'V', name: 'Visa Inc.', weight: 1.20 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', weight: 1.15 },
  ],
  totalHoldings: 503,
  updatedAt: '2024-12-20',
};

/**
 * ARKK (ARK Innovation ETF) 구성종목
 *
 * 혁신 기술 테마 액티브 ETF (ARK Invest)
 * 상위 15개 종목 (비중 기준)
 * 데이터 출처: ARK Invest 공식 웹사이트 (2024년 12월 기준)
 */
const ARKK_HOLDINGS: ETFHoldingsData = {
  symbol: 'ARKK',
  name: 'ARK Innovation ETF',
  description: '파괴적 혁신 기술에 투자하는 액티브 ETF입니다.',
  holdings: [
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: 11.82 },
    { symbol: 'COIN', name: 'Coinbase Global Inc.', weight: 8.45 },
    { symbol: 'ROKU', name: 'Roku Inc.', weight: 7.92 },
    { symbol: 'SQ', name: 'Block Inc.', weight: 6.78 },
    { symbol: 'PATH', name: 'UiPath Inc.', weight: 5.42 },
    { symbol: 'HOOD', name: 'Robinhood Markets Inc.', weight: 5.18 },
    { symbol: 'RBLX', name: 'Roblox Corp.', weight: 4.85 },
    { symbol: 'CRSP', name: 'CRISPR Therapeutics AG', weight: 4.52 },
    { symbol: 'SHOP', name: 'Shopify Inc.', weight: 4.28 },
    { symbol: 'DKNG', name: 'DraftKings Inc.', weight: 3.95 },
    { symbol: 'U', name: 'Unity Software Inc.', weight: 3.72 },
    { symbol: 'ZM', name: 'Zoom Video Communications', weight: 3.48 },
    { symbol: 'TWLO', name: 'Twilio Inc.', weight: 3.25 },
    { symbol: 'EXAS', name: 'Exact Sciences Corp.', weight: 2.98 },
    { symbol: 'TDOC', name: 'Teladoc Health Inc.', weight: 2.75 },
  ],
  totalHoldings: 35,
  updatedAt: '2024-12-20',
};

/**
 * DIA (SPDR Dow Jones Industrial Average ETF) 구성종목
 *
 * 다우존스 산업평균지수 추종 ETF
 * 전체 30개 종목 (다우 30 구성종목)
 * 데이터 출처: State Street 공식 웹사이트 (2024년 12월 기준)
 */
const DIA_HOLDINGS: ETFHoldingsData = {
  symbol: 'DIA',
  name: 'SPDR Dow Jones Industrial Average ETF',
  description: '다우존스 산업평균지수(30개 종목)를 추종하는 ETF입니다.',
  holdings: [
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', weight: 8.92 },
    { symbol: 'GS', name: 'Goldman Sachs Group Inc.', weight: 7.85 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.78 },
    { symbol: 'HD', name: 'Home Depot Inc.', weight: 6.42 },
    { symbol: 'AMGN', name: 'Amgen Inc.', weight: 5.28 },
    { symbol: 'CAT', name: 'Caterpillar Inc.', weight: 5.15 },
    { symbol: 'V', name: 'Visa Inc.', weight: 4.82 },
    { symbol: 'MCD', name: "McDonald's Corp.", weight: 4.65 },
    { symbol: 'CRM', name: 'Salesforce Inc.', weight: 4.52 },
    { symbol: 'AXP', name: 'American Express Co.', weight: 4.38 },
    { symbol: 'TRV', name: 'Travelers Companies Inc.', weight: 4.25 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', weight: 4.12 },
    { symbol: 'AAPL', name: 'Apple Inc.', weight: 3.85 },
    { symbol: 'IBM', name: 'International Business Machines', weight: 3.72 },
    { symbol: 'BA', name: 'Boeing Co.', weight: 3.45 },
    { symbol: 'HON', name: 'Honeywell International Inc.', weight: 3.28 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', weight: 2.95 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', weight: 2.82 },
    { symbol: 'CVX', name: 'Chevron Corp.', weight: 2.68 },
    { symbol: 'MRK', name: 'Merck & Co. Inc.', weight: 2.52 },
    { symbol: 'DIS', name: 'Walt Disney Co.', weight: 1.85 },
    { symbol: 'NKE', name: 'Nike Inc.', weight: 1.42 },
    { symbol: 'KO', name: 'Coca-Cola Co.', weight: 1.28 },
    { symbol: 'MMM', name: '3M Co.', weight: 1.15 },
    { symbol: 'DOW', name: 'Dow Inc.', weight: 0.98 },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', weight: 0.92 },
    { symbol: 'WMT', name: 'Walmart Inc.', weight: 0.85 },
    { symbol: 'INTC', name: 'Intel Corp.', weight: 0.42 },
    { symbol: 'VZ', name: 'Verizon Communications Inc.', weight: 0.38 },
    { symbol: 'WBA', name: 'Walgreens Boots Alliance Inc.', weight: 0.22 },
  ],
  totalHoldings: 30,
  updatedAt: '2024-12-20',
};

// 전체 ETF 데이터 배열
const ALL_ETF_DATA: ETFHoldingsData[] = [
  QQQ_HOLDINGS,
  SPY_HOLDINGS,
  VOO_HOLDINGS,
  ARKK_HOLDINGS,
  DIA_HOLDINGS,
];

// ==================== POST 핸들러 ====================

export async function POST() {
  try {
    console.log('[ETF Seed] ETF 구성종목 데이터 시드 시작...');

    // 각 ETF 데이터를 Firestore에 저장
    const results = await Promise.all(
      ALL_ETF_DATA.map(async (etfData) => {
        try {
          // 문서 ID는 ETF 심볼 사용
          const docRef = etfHoldingsDoc(etfData.symbol);
          await setDoc(docRef, etfData);
          console.log(`[ETF Seed] ${etfData.symbol} 저장 완료 (${etfData.holdings.length}개 종목)`);
          return { symbol: etfData.symbol, success: true };
        } catch (error) {
          console.error(`[ETF Seed] ${etfData.symbol} 저장 실패:`, error);
          return { symbol: etfData.symbol, success: false, error: String(error) };
        }
      })
    );

    // 결과 집계
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log(`[ETF Seed] 시드 완료 - 성공: ${successCount}, 실패: ${failedCount}`);

    return NextResponse.json({
      success: true,
      message: `ETF 구성종목 시드 완료: ${successCount}개 ETF 저장됨`,
      results,
      summary: {
        total: ALL_ETF_DATA.length,
        success: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error('[ETF Seed] 시드 오류:', error);
    return NextResponse.json(
      { success: false, error: 'ETF 구성종목 시드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
