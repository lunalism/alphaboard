'use client';

/**
 * GlobalOverviewContent 컴포넌트
 *
 * 글로벌 시장 > 전체 카테고리 선택 시 표시되는 콘텐츠
 *
 * ============================================================
 * 데이터 소스 (실시간 API):
 * ============================================================
 * - 환율: /api/bok/exchange-rate (한국은행 ECOS API)
 * - 원자재: /api/commodities (한국투자증권 ETF 기반)
 * - 암호화폐: /api/crypto (CoinGecko API)
 *
 * ============================================================
 * 표시 순서 (일반 투자자 관점에서 중요도 순):
 * ============================================================
 * 1. 환율 - 가장 기본적인 투자 정보
 * 2. 원자재 - 금, 유가 등 주요 자산
 * 3. 암호화폐 - 특수 자산
 *
 * ============================================================
 * 자동 갱신:
 * ============================================================
 * - 1분마다 자동 새로고침
 * - 개별 탭과 동일한 갱신 주기
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ==================== 상수 정의 ====================

/** 자동 새로고침 간격 (1분 = 60,000ms) */
const AUTO_REFRESH_INTERVAL = 60000;

// ==================== 타입 정의 ====================

/** 환율 데이터 타입 (한국은행 API 응답) */
interface ExchangeRateData {
  rate: number;
  change: number;
  changePercent: number;
  date: string;
}

/** 환율 API 응답 타입 */
interface ExchangeRateAPIResponse {
  success: boolean;
  data: {
    usdkrw: ExchangeRateData;
    jpykrw: ExchangeRateData;
    eurkrw: ExchangeRateData;
    gbpkrw: ExchangeRateData;
  } | null;
  timestamp: string;
}

/** 원자재 데이터 타입 */
interface CommodityData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  chartData: number[];
  etfSymbol: string;
}

/** 원자재 API 응답 타입 */
interface CommoditiesAPIResponse {
  success: boolean;
  data: CommodityData[] | null;
  timestamp: string;
  source: 'api' | 'fallback';
}

/** 암호화폐 데이터 타입 */
interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: string;
  volume24h: string;
  icon: string;
  chartData: number[];
}

/** 암호화폐 API 응답 타입 */
interface CryptoAPIResponse {
  success: boolean;
  data: CryptoData[] | null;
  timestamp: string;
  source: 'api' | 'fallback';
}

// ==================== 유틸리티 컴포넌트 ====================

/**
 * 미니 차트 컴포넌트
 * 가격 추이를 SVG 라인으로 시각화
 */
function MiniChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 * 데이터 로딩 중 표시되는 플레이스홀더
 */
function SummarySkeleton({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 px-3 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="w-10 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="text-right">
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 포맷팅 함수 ====================

/**
 * 원화 환율 포맷팅 (예: 1,427.00원)
 */
function formatKRWRate(rate: number): string {
  return rate.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '원';
}

/**
 * 달러 가격 포맷팅
 */
function formatUSDPrice(price: number): string {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return '$' + price.toFixed(2);
}

/**
 * 변동률 포맷팅
 */
function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 차트 데이터 생성 (환율용 - API에서 chartData를 제공하지 않는 경우)
 * 현재 환율과 변동률 기반으로 추세 데이터 생성
 */
function generateChartData(currentRate: number, changePercent: number): number[] {
  const points = 9;
  const data: number[] = [];
  const trend = changePercent / 100;
  const volatility = Math.abs(trend) * 0.3;

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const baseChange = trend * (1 - progress);
    const noise = (Math.random() - 0.5) * volatility * (1 - progress);
    const rate = currentRate * (1 - baseChange + noise);
    data.push(Math.round(rate * 100) / 100);
  }

  return data;
}

// ==================== 섹션 컴포넌트 ====================

/**
 * 환율 요약 섹션 (원화 기준)
 *
 * 실시간 API 데이터를 사용하여 주요 4개 통화의 원화 환율 표시
 *
 * 표기법: "원/외화" (한국 원화가 먼저)
 * 국기 순서: 🇰🇷(한국) + 외국 국기
 */
function ForexSummary({
  data,
  isLoading,
}: {
  data: ExchangeRateAPIResponse['data'];
  isLoading: boolean;
}) {
  // 로딩 중
  if (isLoading) {
    return <SummarySkeleton title="환율" icon="💱" />;
  }

  // 데이터 없음
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>💱</span>
          <span>환율</span>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 원화 기준 환율 목록 구성
  const krwForexList = [
    {
      id: 'usdkrw',
      pair: '원/달러',
      name: '미국 달러',
      krwRate: data.usdkrw.rate,
      changePercent: data.usdkrw.changePercent,
      chartData: generateChartData(data.usdkrw.rate, data.usdkrw.changePercent),
      flags: '🇰🇷🇺🇸',
    },
    {
      id: 'eurkrw',
      pair: '원/유로',
      name: '유럽 유로',
      krwRate: data.eurkrw.rate,
      changePercent: data.eurkrw.changePercent,
      chartData: generateChartData(data.eurkrw.rate, data.eurkrw.changePercent),
      flags: '🇰🇷🇪🇺',
    },
    {
      id: 'jpykrw',
      pair: '원/100엔',
      name: '일본 엔',
      // 100엔 단위로 표시 (API는 1엔당 가격 제공)
      krwRate: data.jpykrw.rate * 100 / 100,
      changePercent: data.jpykrw.changePercent,
      chartData: generateChartData(data.jpykrw.rate, data.jpykrw.changePercent),
      flags: '🇰🇷🇯🇵',
    },
    {
      id: 'gbpkrw',
      pair: '원/파운드',
      name: '영국 파운드',
      krwRate: data.gbpkrw.rate,
      changePercent: data.gbpkrw.changePercent,
      chartData: generateChartData(data.gbpkrw.rate, data.gbpkrw.changePercent),
      flags: '🇰🇷🇬🇧',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>💱</span>
        <span>환율</span>
        <span className="text-xs font-normal text-gray-400">(원화 기준)</span>
      </h3>
      <div className="space-y-3">
        {krwForexList.map((forex) => {
          const isPositive = forex.changePercent >= 0;
          return (
            <div
              key={forex.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{forex.flags}</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {forex.pair}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{forex.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={forex.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatKRWRate(forex.krwRate)}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatPercent(forex.changePercent)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 원자재 요약 섹션
 *
 * 실시간 API 데이터를 사용하여 상위 4개 원자재 표시
 */
function CommoditySummary({
  data,
  isLoading,
}: {
  data: CommodityData[] | null;
  isLoading: boolean;
}) {
  // 원자재별 아이콘
  const getCommodityIcon = (id: string): string => {
    const icons: Record<string, string> = {
      gold: '🥇',
      silver: '🥈',
      oil: '🛢️',
      brent: '🛢️',
      natgas: '🔥',
      copper: '🔶',
      platinum: '💎',
    };
    return icons[id] || '📦';
  };

  // 로딩 중
  if (isLoading) {
    return <SummarySkeleton title="원자재" icon="🛢️" />;
  }

  // 데이터 없음
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🛢️</span>
          <span>원자재</span>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 상위 4개만 표시
  const topCommodities = data.slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🛢️</span>
        <span>원자재</span>
      </h3>
      <div className="space-y-3">
        {topCommodities.map((commodity) => {
          const isPositive = commodity.changePercent >= 0;
          return (
            <div
              key={commodity.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg">
                  {getCommodityIcon(commodity.id)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {commodity.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {commodity.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={commodity.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatUSDPrice(commodity.price)}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatPercent(commodity.changePercent)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 암호화폐 요약 섹션
 *
 * 실시간 API 데이터를 사용하여 상위 4개 암호화폐 표시
 */
function CryptoSummary({
  data,
  isLoading,
}: {
  data: CryptoData[] | null;
  isLoading: boolean;
}) {
  // 로딩 중
  if (isLoading) {
    return <SummarySkeleton title="암호화폐" icon="₿" />;
  }

  // 데이터 없음
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>₿</span>
          <span>암호화폐</span>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          데이터를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  // 상위 4개만 표시
  const topCryptos = data.slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>₿</span>
        <span>암호화폐</span>
      </h3>
      <div className="space-y-3">
        {topCryptos.map((crypto) => {
          const isPositive = crypto.changePercent24h >= 0;
          return (
            <div
              key={crypto.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                  {crypto.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {crypto.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{crypto.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={crypto.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatUSDPrice(crypto.price)}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatPercent(crypto.changePercent24h)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

/**
 * 글로벌 시장 요약 컴포넌트
 *
 * 환율, 원자재, 암호화폐 데이터를 실시간 API에서 조회하여 표시합니다.
 * 1분마다 자동으로 데이터를 갱신합니다.
 */
export function GlobalOverviewContent() {
  // ==================== 상태 관리 ====================

  // 환율 데이터
  const [forexData, setForexData] = useState<ExchangeRateAPIResponse['data']>(null);
  const [isForexLoading, setIsForexLoading] = useState(true);

  // 원자재 데이터
  const [commodityData, setCommodityData] = useState<CommodityData[] | null>(null);
  const [isCommodityLoading, setIsCommodityLoading] = useState(true);

  // 암호화폐 데이터
  const [cryptoData, setCryptoData] = useState<CryptoData[] | null>(null);
  const [isCryptoLoading, setIsCryptoLoading] = useState(true);

  // 마지막 갱신 시간
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 자동 새로고침 타이머
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== 데이터 로드 함수 ====================

  /**
   * 환율 데이터 로드
   */
  const loadForexData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsForexLoading(true);

    try {
      const response = await fetch('/api/bok/exchange-rate', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const result: ExchangeRateAPIResponse = await response.json();

      if (result.success && result.data) {
        setForexData(result.data);
      }
    } catch (error) {
      console.error('[GlobalOverview] 환율 데이터 로드 실패:', error);
    } finally {
      if (!isRefresh) setIsForexLoading(false);
    }
  }, []);

  /**
   * 원자재 데이터 로드
   */
  const loadCommodityData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsCommodityLoading(true);

    try {
      const response = await fetch('/api/commodities', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const result: CommoditiesAPIResponse = await response.json();

      if (result.success && result.data) {
        setCommodityData(result.data);
      }
    } catch (error) {
      console.error('[GlobalOverview] 원자재 데이터 로드 실패:', error);
    } finally {
      if (!isRefresh) setIsCommodityLoading(false);
    }
  }, []);

  /**
   * 암호화폐 데이터 로드
   */
  const loadCryptoData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsCryptoLoading(true);

    try {
      const response = await fetch('/api/crypto', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const result: CryptoAPIResponse = await response.json();

      if (result.success && result.data) {
        setCryptoData(result.data);
      }
    } catch (error) {
      console.error('[GlobalOverview] 암호화폐 데이터 로드 실패:', error);
    } finally {
      if (!isRefresh) setIsCryptoLoading(false);
    }
  }, []);

  /**
   * 모든 데이터 로드 (병렬 실행)
   */
  const loadAllData = useCallback(
    async (isRefresh = false) => {
      // 병렬로 모든 API 호출
      await Promise.all([
        loadForexData(isRefresh),
        loadCommodityData(isRefresh),
        loadCryptoData(isRefresh),
      ]);

      // 갱신 시간 업데이트
      setLastUpdated(new Date());

      if (isRefresh) {
        console.log('[GlobalOverview] 데이터 자동 갱신 완료');
      } else {
        console.log('[GlobalOverview] 초기 데이터 로드 완료');
      }
    },
    [loadForexData, loadCommodityData, loadCryptoData]
  );

  // ==================== 효과 ====================

  /**
   * 초기 로드 및 자동 새로고침 설정
   */
  useEffect(() => {
    // 초기 데이터 로드
    loadAllData(false);

    // 자동 새로고침 타이머 설정 (1분마다)
    refreshTimerRef.current = setInterval(() => {
      loadAllData(true);
    }, AUTO_REFRESH_INTERVAL);

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadAllData]);

  // ==================== 렌더링 ====================

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            글로벌 시장 요약
            <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
              1분 자동갱신
            </span>
          </h2>
          {/* 마지막 갱신 시간 */}
          {lastUpdated && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              마지막 갱신: {lastUpdated.toLocaleTimeString('ko-KR')}
            </p>
          )}
        </div>
        {/* 실시간 표시 */}
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          📡 실시간
        </span>
      </div>

      {/* 3열 그리드 레이아웃 - 중요도 순: 환율 → 원자재 → 암호화폐 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ForexSummary data={forexData} isLoading={isForexLoading} />
        <CommoditySummary data={commodityData} isLoading={isCommodityLoading} />
        <CryptoSummary data={cryptoData} isLoading={isCryptoLoading} />
      </div>
    </section>
  );
}
