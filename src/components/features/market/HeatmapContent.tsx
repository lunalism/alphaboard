'use client';

/**
 * HeatmapContent 컴포넌트
 *
 * Finviz 스타일의 섹터별 주식 히트맵을 표시합니다.
 *
 * ============================================================
 * 핵심 기능:
 * ============================================================
 * 1. 섹터별 그룹화 (TECHNOLOGY, HEALTHCARE, 반도체, 금융 등)
 * 2. 시가총액 기준 박스 크기 (삼성전자 = 큰 박스, 소형주 = 작은 박스)
 * 3. 등락률 기준 색상 (한국: 빨강=상승, 미국: 초록=상승)
 * 4. 종목 클릭 시 상세 페이지 이동
 *
 * ============================================================
 * 레이아웃:
 * ============================================================
 * ┌─ TECHNOLOGY ─────────────────────────┐
 * │ ┌──────┬──────┬────────┬────┬────┐  │
 * │ │ MSFT │ AAPL │  NVDA  │AVGO│AMD │  │
 * │ │+3.2% │-0.1% │ +1.5%  │-1% │+2% │  │
 * │ └──────┴──────┴────────┴────┴────┘  │
 * └──────────────────────────────────────┘
 *
 * ============================================================
 * 색상 규칙:
 * ============================================================
 * 한국 스타일: 상승=빨강, 하락=파랑
 * 미국 스타일: 상승=초록, 하락=빨강
 */

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MarketRegion } from '@/types';

// ==================== 타입 정의 ====================

interface StockData {
  symbol: string;       // 티커 심볼
  name: string;         // 종목명
  marketCap: number;    // 시가총액 (억원 또는 백만달러)
  changePercent: number; // 등락률
  price: number;        // 현재가
}

interface SectorData {
  name: string;         // 섹터명
  stocks: StockData[];  // 섹터 내 종목들
}

// ==================== 한국 시장 섹터 데이터 ====================

const KOREA_SECTORS: SectorData[] = [
  {
    name: '반도체',
    stocks: [
      { symbol: '005930', name: '삼성전자', marketCap: 3500000, changePercent: 1.2, price: 58000 },
      { symbol: '000660', name: 'SK하이닉스', marketCap: 1100000, changePercent: 2.5, price: 150000 },
      { symbol: '402340', name: 'SK스퀘어', marketCap: 120000, changePercent: -0.8, price: 85000 },
    ],
  },
  {
    name: '자동차',
    stocks: [
      { symbol: '005380', name: '현대차', marketCap: 450000, changePercent: 0.5, price: 210000 },
      { symbol: '000270', name: '기아', marketCap: 380000, changePercent: 1.8, price: 95000 },
      { symbol: '012330', name: '현대모비스', marketCap: 180000, changePercent: -1.2, price: 190000 },
    ],
  },
  {
    name: '금융',
    stocks: [
      { symbol: '105560', name: 'KB금융', marketCap: 280000, changePercent: 0.3, price: 68000 },
      { symbol: '055550', name: '신한지주', marketCap: 200000, changePercent: -0.5, price: 42000 },
      { symbol: '086790', name: '하나금융', marketCap: 150000, changePercent: 0.8, price: 52000 },
      { symbol: '000810', name: '삼성화재', marketCap: 140000, changePercent: 1.5, price: 295000 },
      { symbol: '316140', name: '우리금융', marketCap: 100000, changePercent: -0.2, price: 14000 },
    ],
  },
  {
    name: '바이오',
    stocks: [
      { symbol: '207940', name: '삼성바이오', marketCap: 600000, changePercent: -2.1, price: 850000 },
      { symbol: '068270', name: '셀트리온', marketCap: 250000, changePercent: 1.2, price: 180000 },
      { symbol: '000100', name: '유한양행', marketCap: 80000, changePercent: 0.5, price: 120000 },
      { symbol: '326030', name: 'SK바이오팜', marketCap: 70000, changePercent: 3.2, price: 95000 },
    ],
  },
  {
    name: 'IT/인터넷',
    stocks: [
      { symbol: '035420', name: 'NAVER', marketCap: 350000, changePercent: -0.8, price: 215000 },
      { symbol: '035720', name: '카카오', marketCap: 220000, changePercent: 0.3, price: 50000 },
      { symbol: '259960', name: '크래프톤', marketCap: 150000, changePercent: 2.1, price: 320000 },
      { symbol: '263750', name: '펄어비스', marketCap: 30000, changePercent: -1.5, price: 45000 },
    ],
  },
  {
    name: '2차전지',
    stocks: [
      { symbol: '373220', name: 'LG에너지솔루션', marketCap: 900000, changePercent: -1.5, price: 380000 },
      { symbol: '006400', name: '삼성SDI', marketCap: 350000, changePercent: 0.8, price: 510000 },
      { symbol: '247540', name: '에코프로비엠', marketCap: 150000, changePercent: 4.2, price: 160000 },
      { symbol: '086520', name: '에코프로', marketCap: 100000, changePercent: 5.1, price: 75000 },
    ],
  },
  {
    name: '화학',
    stocks: [
      { symbol: '051910', name: 'LG화학', marketCap: 280000, changePercent: -0.5, price: 400000 },
      { symbol: '011170', name: '롯데케미칼', marketCap: 50000, changePercent: -2.3, price: 145000 },
      { symbol: '010950', name: 'S-Oil', marketCap: 60000, changePercent: 0.2, price: 52000 },
    ],
  },
  {
    name: '철강/조선',
    stocks: [
      { symbol: '005490', name: 'POSCO홀딩스', marketCap: 280000, changePercent: 1.8, price: 330000 },
      { symbol: '009540', name: 'HD한국조선', marketCap: 150000, changePercent: 3.5, price: 180000 },
      { symbol: '010140', name: '삼성중공업', marketCap: 80000, changePercent: 2.8, price: 12000 },
      { symbol: '042660', name: '한화오션', marketCap: 100000, changePercent: 4.2, price: 45000 },
    ],
  },
  {
    name: '방산',
    stocks: [
      { symbol: '012450', name: '한화에어로', marketCap: 200000, changePercent: 2.5, price: 380000 },
      { symbol: '079550', name: 'LIG넥스원', marketCap: 50000, changePercent: 1.8, price: 180000 },
      { symbol: '047810', name: '한국항공우주', marketCap: 80000, changePercent: 3.2, price: 62000 },
    ],
  },
  {
    name: '통신/유틸',
    stocks: [
      { symbol: '017670', name: 'SK텔레콤', marketCap: 130000, changePercent: 0.2, price: 52000 },
      { symbol: '030200', name: 'KT', marketCap: 80000, changePercent: -0.3, price: 38000 },
      { symbol: '032640', name: 'LG유플러스', marketCap: 50000, changePercent: 0.5, price: 11500 },
      { symbol: '015760', name: '한국전력', marketCap: 120000, changePercent: -1.2, price: 18500 },
    ],
  },
  {
    name: '엔터/미디어',
    stocks: [
      { symbol: '352820', name: '하이브', marketCap: 100000, changePercent: -2.5, price: 240000 },
      { symbol: '035900', name: 'JYP Ent.', marketCap: 30000, changePercent: 1.2, price: 85000 },
      { symbol: '041510', name: 'SM', marketCap: 20000, changePercent: 0.8, price: 82000 },
    ],
  },
  {
    name: '유통/소비재',
    stocks: [
      { symbol: '004170', name: '신세계', marketCap: 25000, changePercent: -0.8, price: 130000 },
      { symbol: '023530', name: '롯데쇼핑', marketCap: 15000, changePercent: -1.5, price: 80000 },
      { symbol: '139480', name: '이마트', marketCap: 30000, changePercent: 0.3, price: 60000 },
      { symbol: '051900', name: 'LG생건', marketCap: 80000, changePercent: -0.5, price: 280000 },
    ],
  },
];

// ==================== 미국 시장 섹터 데이터 ====================

const US_SECTORS: SectorData[] = [
  {
    name: 'TECHNOLOGY',
    stocks: [
      { symbol: 'AAPL', name: 'Apple', marketCap: 3000000, changePercent: -0.1, price: 195.5 },
      { symbol: 'MSFT', name: 'Microsoft', marketCap: 2800000, changePercent: 1.2, price: 378.2 },
      { symbol: 'NVDA', name: 'NVIDIA', marketCap: 1200000, changePercent: 3.5, price: 495.8 },
      { symbol: 'AVGO', name: 'Broadcom', marketCap: 600000, changePercent: 2.1, price: 1250.3 },
      { symbol: 'AMD', name: 'AMD', marketCap: 200000, changePercent: -1.8, price: 125.4 },
      { symbol: 'INTC', name: 'Intel', marketCap: 100000, changePercent: -3.2, price: 24.5 },
      { symbol: 'CRM', name: 'Salesforce', marketCap: 250000, changePercent: 0.8, price: 265.2 },
      { symbol: 'ORCL', name: 'Oracle', marketCap: 350000, changePercent: 1.5, price: 128.4 },
    ],
  },
  {
    name: 'CONSUMER CYCLICAL',
    stocks: [
      { symbol: 'AMZN', name: 'Amazon', marketCap: 1500000, changePercent: 0.5, price: 145.2 },
      { symbol: 'TSLA', name: 'Tesla', marketCap: 800000, changePercent: -2.3, price: 252.8 },
      { symbol: 'HD', name: 'Home Depot', marketCap: 350000, changePercent: 0.8, price: 345.6 },
      { symbol: 'MCD', name: "McDonald's", marketCap: 200000, changePercent: 0.3, price: 278.4 },
      { symbol: 'NKE', name: 'Nike', marketCap: 150000, changePercent: -1.5, price: 98.2 },
      { symbol: 'SBUX', name: 'Starbucks', marketCap: 100000, changePercent: -0.8, price: 92.5 },
    ],
  },
  {
    name: 'COMMUNICATION',
    stocks: [
      { symbol: 'GOOGL', name: 'Alphabet', marketCap: 1800000, changePercent: 0.8, price: 142.5 },
      { symbol: 'META', name: 'Meta', marketCap: 1000000, changePercent: 1.5, price: 395.2 },
      { symbol: 'NFLX', name: 'Netflix', marketCap: 250000, changePercent: 2.1, price: 575.8 },
      { symbol: 'DIS', name: 'Disney', marketCap: 180000, changePercent: -0.5, price: 98.4 },
      { symbol: 'T', name: 'AT&T', marketCap: 120000, changePercent: 0.2, price: 16.8 },
      { symbol: 'VZ', name: 'Verizon', marketCap: 150000, changePercent: -0.3, price: 35.6 },
    ],
  },
  {
    name: 'HEALTHCARE',
    stocks: [
      { symbol: 'LLY', name: 'Eli Lilly', marketCap: 700000, changePercent: 1.8, price: 780.5 },
      { symbol: 'UNH', name: 'UnitedHealth', marketCap: 500000, changePercent: -0.5, price: 525.2 },
      { symbol: 'JNJ', name: 'J&J', marketCap: 400000, changePercent: 0.3, price: 165.8 },
      { symbol: 'PFE', name: 'Pfizer', marketCap: 150000, changePercent: -1.2, price: 26.4 },
      { symbol: 'MRK', name: 'Merck', marketCap: 300000, changePercent: 0.8, price: 118.2 },
      { symbol: 'ABBV', name: 'AbbVie', marketCap: 280000, changePercent: 0.5, price: 158.4 },
    ],
  },
  {
    name: 'FINANCIAL',
    stocks: [
      { symbol: 'JPM', name: 'JPMorgan', marketCap: 500000, changePercent: 0.8, price: 175.2 },
      { symbol: 'V', name: 'Visa', marketCap: 450000, changePercent: 0.5, price: 265.4 },
      { symbol: 'MA', name: 'Mastercard', marketCap: 400000, changePercent: 0.6, price: 428.6 },
      { symbol: 'BAC', name: 'BofA', marketCap: 280000, changePercent: -0.3, price: 35.8 },
      { symbol: 'WFC', name: 'Wells Fargo', marketCap: 180000, changePercent: 0.2, price: 48.5 },
      { symbol: 'GS', name: 'Goldman', marketCap: 150000, changePercent: 1.2, price: 458.2 },
    ],
  },
  {
    name: 'INDUSTRIALS',
    stocks: [
      { symbol: 'CAT', name: 'Caterpillar', marketCap: 180000, changePercent: 0.8, price: 365.4 },
      { symbol: 'BA', name: 'Boeing', marketCap: 120000, changePercent: -2.5, price: 195.2 },
      { symbol: 'GE', name: 'GE Aero', marketCap: 180000, changePercent: 1.5, price: 165.8 },
      { symbol: 'RTX', name: 'RTX Corp', marketCap: 150000, changePercent: 0.3, price: 112.4 },
      { symbol: 'HON', name: 'Honeywell', marketCap: 140000, changePercent: -0.5, price: 215.6 },
      { symbol: 'UPS', name: 'UPS', marketCap: 100000, changePercent: -1.2, price: 125.8 },
    ],
  },
  {
    name: 'CONSUMER DEFENSIVE',
    stocks: [
      { symbol: 'WMT', name: 'Walmart', marketCap: 450000, changePercent: 0.5, price: 165.2 },
      { symbol: 'KO', name: 'Coca-Cola', marketCap: 280000, changePercent: 0.2, price: 65.4 },
      { symbol: 'PG', name: 'P&G', marketCap: 350000, changePercent: 0.3, price: 148.6 },
      { symbol: 'COST', name: 'Costco', marketCap: 350000, changePercent: 0.8, price: 785.4 },
      { symbol: 'PEP', name: 'PepsiCo', marketCap: 250000, changePercent: -0.2, price: 175.2 },
    ],
  },
  {
    name: 'ENERGY',
    stocks: [
      { symbol: 'XOM', name: 'Exxon', marketCap: 450000, changePercent: -0.8, price: 108.5 },
      { symbol: 'CVX', name: 'Chevron', marketCap: 280000, changePercent: -1.2, price: 148.2 },
      { symbol: 'COP', name: 'Conoco', marketCap: 130000, changePercent: -0.5, price: 112.4 },
    ],
  },
];

// ==================== 색상 함수 ====================

/**
 * 등락률에 따른 배경색 반환
 *
 * @param changePercent - 등락률
 * @param isKorean - 한국 시장 여부 (한국: 빨강=상승, 미국: 초록=상승)
 * @returns Tailwind CSS 클래스
 */
function getHeatmapColorClass(changePercent: number, isKorean: boolean): string {
  const absChange = Math.abs(changePercent);

  // 보합 (±0.1% 미만)
  if (absChange < 0.1) {
    return 'bg-gray-500';
  }

  if (isKorean) {
    // 한국 스타일: 상승=빨강, 하락=파랑
    if (changePercent > 0) {
      if (absChange >= 3) return 'bg-red-700';
      if (absChange >= 2) return 'bg-red-600';
      if (absChange >= 1) return 'bg-red-500';
      return 'bg-red-400';
    } else {
      if (absChange >= 3) return 'bg-blue-700';
      if (absChange >= 2) return 'bg-blue-600';
      if (absChange >= 1) return 'bg-blue-500';
      return 'bg-blue-400';
    }
  } else {
    // 미국 스타일: 상승=초록, 하락=빨강
    if (changePercent > 0) {
      if (absChange >= 3) return 'bg-green-700';
      if (absChange >= 2) return 'bg-green-600';
      if (absChange >= 1) return 'bg-green-500';
      return 'bg-green-400';
    } else {
      if (absChange >= 3) return 'bg-red-700';
      if (absChange >= 2) return 'bg-red-600';
      if (absChange >= 1) return 'bg-red-500';
      return 'bg-red-400';
    }
  }
}

/**
 * 시가총액 기준 박스 크기 클래스 반환
 * 섹터 내 최대 시총 대비 비율로 계산
 */
function getBoxSizeClass(marketCap: number, maxMarketCap: number): string {
  const ratio = marketCap / maxMarketCap;

  if (ratio >= 0.7) return 'col-span-2 row-span-2';
  if (ratio >= 0.4) return 'col-span-2';
  if (ratio >= 0.2) return 'col-span-1';
  return 'col-span-1';
}

// ==================== 포맷팅 함수 ====================

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatPrice(value: number, isKorean: boolean): string {
  if (isKorean) {
    return `₩${value.toLocaleString()}`;
  }
  return `$${value.toFixed(2)}`;
}

// ==================== 섹터 히트맵 그리드 컴포넌트 ====================

interface SectorGridProps {
  sector: SectorData;
  isKorean: boolean;
  onStockClick: (symbol: string) => void;
}

/**
 * 개별 섹터 히트맵 그리드
 *
 * Finviz 스타일의 섹터 박스:
 * ┌─ SECTOR NAME ───────────────────┐
 * │ ┌─────┬─────┬───────┬────┬───┐ │
 * │ │TICK │TICK │ TICK  │TICK│...│ │
 * │ │+1.2%│-0.5%│ +3.2% │-1% │...│ │
 * │ └─────┴─────┴───────┴────┴───┘ │
 * └─────────────────────────────────┘
 */
function SectorGrid({ sector, isKorean, onStockClick }: SectorGridProps) {
  // 섹터 내 최대 시가총액 계산
  const maxMarketCap = useMemo(
    () => Math.max(...sector.stocks.map((s) => s.marketCap)),
    [sector.stocks]
  );

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* 섹터 헤더 */}
      <div className="px-3 py-1.5 bg-gray-900 border-b border-gray-700">
        <h3 className="text-xs font-bold text-gray-300 tracking-wider">
          {sector.name}
        </h3>
      </div>

      {/* 종목 그리드 */}
      <div className="p-1.5 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 auto-rows-fr">
        {sector.stocks.map((stock) => {
          const colorClass = getHeatmapColorClass(stock.changePercent, isKorean);
          const sizeClass = getBoxSizeClass(stock.marketCap, maxMarketCap);

          return (
            <div
              key={stock.symbol}
              onClick={() => onStockClick(stock.symbol)}
              className={`
                ${colorClass} ${sizeClass}
                flex flex-col items-center justify-center
                p-1.5 rounded cursor-pointer
                hover:opacity-80 hover:ring-2 hover:ring-white/30
                transition-all duration-150
                min-h-[48px]
              `}
              title={`${stock.name} (${stock.symbol})\n${formatPrice(stock.price, isKorean)}`}
            >
              {/* 티커 심볼 */}
              <span className="text-[10px] md:text-xs font-bold text-white truncate max-w-full">
                {stock.symbol}
              </span>
              {/* 등락률 */}
              <span className="text-[9px] md:text-[10px] font-medium text-white/90">
                {formatPercent(stock.changePercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 모바일 리스트 뷰 ====================

function MobileListView({
  sectors,
  isKorean,
  onStockClick,
}: {
  sectors: SectorData[];
  isKorean: boolean;
  onStockClick: (symbol: string) => void;
}) {
  return (
    <div className="space-y-4">
      {sectors.map((sector) => (
        <div
          key={sector.name}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* 섹터 헤더 */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              {sector.name}
            </h4>
          </div>
          {/* 종목 리스트 */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sector.stocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => onStockClick(stock.symbol)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {stock.name}
                    </div>
                    <div className="text-xs text-gray-500">{stock.symbol}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {formatPrice(stock.price, isKorean)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isPositive
                          ? isKorean
                            ? 'text-red-500'
                            : 'text-green-500'
                          : isKorean
                            ? 'text-blue-500'
                            : 'text-red-500'
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

interface HeatmapContentProps {
  /** 선택된 국가 (kr: 한국, us: 미국) */
  country: MarketRegion;
}

export function HeatmapContent({ country }: HeatmapContentProps) {
  const router = useRouter();
  const isKorean = country === 'kr';

  // 국가별 섹터 데이터 선택
  const sectors = isKorean ? KOREA_SECTORS : US_SECTORS;

  // 종목 클릭 핸들러
  const handleStockClick = useCallback(
    (symbol: string) => {
      router.push(`/market/${symbol}`);
    },
    [router]
  );

  // 일본/홍콩 미지원 메시지
  if (country === 'jp' || country === 'hk') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          준비 중입니다
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {country === 'jp' ? '일본' : '홍콩'} 시장 히트맵은 곧 제공될 예정입니다.
        </p>
      </div>
    );
  }

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isKorean ? '🇰🇷 한국 시장 히트맵' : '🇺🇸 미국 시장 히트맵'}
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded ${isKorean ? 'bg-red-500' : 'bg-green-500'}`}
            />
            <span className="text-gray-600 dark:text-gray-400">상승</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded ${isKorean ? 'bg-blue-500' : 'bg-red-500'}`}
            />
            <span className="text-gray-600 dark:text-gray-400">하락</span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        박스 크기는 시가총액, 색상 강도는 등락률을 나타냅니다. 클릭하면 상세 페이지로 이동합니다.
      </p>

      {/* 데스크톱: 그리드 히트맵 */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {sectors.map((sector) => (
          <SectorGrid
            key={sector.name}
            sector={sector}
            isKorean={isKorean}
            onStockClick={handleStockClick}
          />
        ))}
      </div>

      {/* 모바일: 리스트 뷰 */}
      <div className="md:hidden">
        <MobileListView
          sectors={sectors}
          isKorean={isKorean}
          onStockClick={handleStockClick}
        />
      </div>
    </section>
  );
}
