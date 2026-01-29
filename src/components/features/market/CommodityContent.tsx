'use client';

/**
 * CommodityContent 컴포넌트
 *
 * 원자재 카테고리 선택 시 표시되는 콘텐츠
 * Gold, Silver, Crude Oil, Brent, Copper, Platinum 등 표시
 *
 * ============================================================
 * 데이터 소스:
 * ============================================================
 * - /api/commodities 엔드포인트 호출
 * - 한국투자증권 API를 통해 원자재 ETF 가격 조회
 * - ETF 가격을 선물 가격으로 변환하여 표시
 * - API 실패 시 fallback 데이터 사용
 *
 * ============================================================
 * 표시 원자재:
 * ============================================================
 * - Gold (GLD ETF 기반)
 * - Silver (SLV ETF 기반)
 * - Crude Oil WTI (DBO ETF 기반)
 * - Brent Crude (BNO ETF 기반)
 * - Copper (CPER ETF 기반)
 * - Platinum (PPLT ETF 기반)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// 상수 정의
// ============================================

/** 원자재 자동 새로고침 간격 (1분 = 60,000ms) */
const COMMODITY_REFRESH_INTERVAL = 60000;

// ============================================
// 타입 정의
// ============================================

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

/** API 응답 타입 */
interface CommoditiesAPIResponse {
  success: boolean;
  data: CommodityData[] | null;
  error?: string;
  timestamp: string;
  source: 'api' | 'fallback';
}

// ============================================
// 컴포넌트
// ============================================

/**
 * 미니 차트 컴포넌트
 * 원자재의 최근 가격 추이를 SVG 라인으로 시각화
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
    <svg viewBox="0 0 100 100" className="w-20 h-10" preserveAspectRatio="none">
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
 * 원자재별 아이콘 반환
 */
function getCommodityIcon(id: string): string {
  const icons: Record<string, string> = {
    gold: '🥇',
    silver: '🥈',
    oil: '🛢️',
    brent: '🛢️',
    natgas: '🔥',
    copper: '🔶',
    platinum: '💎',
    wheat: '🌾',
  };
  return icons[id] || '📦';
}

/**
 * 원자재 카드 컴포넌트
 * 개별 원자재 정보를 카드 형태로 표시
 */
function CommodityCard({ commodity }: { commodity: CommodityData }) {
  const router = useRouter();
  const isPositive = commodity.change >= 0;

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 변동 포맷팅
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return sign + '$' + Math.abs(change).toFixed(2);
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => router.push(`/market/${commodity.symbol}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 아이콘 + 이름 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 원자재 아이콘 */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl">
            {getCommodityIcon(commodity.id)}
          </div>
          <div>
            {/* 원자재 이름 */}
            <h3 className="font-semibold text-gray-900 dark:text-white">{commodity.name}</h3>
            {/* 심볼 */}
            <p className="text-sm text-gray-500 dark:text-gray-400">{commodity.symbol}</p>
          </div>
        </div>
        {/* 미니 차트 */}
        <MiniChart data={commodity.chartData} isPositive={isPositive} />
      </div>

      {/* 가격 정보 */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(commodity.price)}</p>
          {/* 단위 */}
          <span className="text-sm text-gray-500 dark:text-gray-400">{commodity.unit}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatChange(commodity.change)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatPercent(commodity.changePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function CommoditySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div>
                <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * 원자재 콘텐츠 컴포넌트
 *
 * /api/commodities 엔드포인트를 통해 실시간 원자재 시세를 조회합니다.
 */
export function CommodityContent() {
  // 상태 관리
  const [commodities, setCommodities] = useState<CommodityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 자동 새로고침 타이머 ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 원자재 데이터 로드 함수
   */
  const loadCommodities = useCallback(async (isRefresh = false) => {
    // 초기 로드 시에만 로딩 표시
    if (!isRefresh) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/commodities', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data: CommoditiesAPIResponse = await response.json();

      if (data.success && data.data) {
        setCommodities(data.data);
        setDataSource(data.source);
        setLastUpdated(new Date());

        if (isRefresh) {
          console.log('[CommodityContent] 원자재 자동 갱신 완료');
        } else {
          console.log('[CommodityContent] 원자재 데이터 로드 성공', {
            source: data.source,
            count: data.data.length,
          });
        }
      } else {
        throw new Error(data.error || '데이터 조회 실패');
      }
    } catch (err) {
      console.error('[CommodityContent] 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '원자재 데이터를 불러오는데 실패했습니다.');
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  }, []);

  // 초기 로드 및 자동 새로고침 설정
  useEffect(() => {
    // 초기 로드
    loadCommodities(false);

    // 자동 새로고침 타이머 설정 (1분마다)
    refreshTimerRef.current = setInterval(() => {
      loadCommodities(true);
    }, COMMODITY_REFRESH_INTERVAL);

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadCommodities]);

  // 로딩 중
  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          원자재
        </h2>
        <CommoditySkeleton />
      </section>
    );
  }

  // 에러 상태
  if (error && commodities.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          원자재
        </h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            원자재
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
        {/* 데이터 소스 표시 */}
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            dataSource === 'api'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {dataSource === 'api' ? '📈 실시간' : '📊 샘플 데이터'}
          </span>
          {dataSource === 'api' && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              ETF 기반 선물 가격
            </span>
          )}
        </div>
      </div>

      {/* 원자재 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {commodities.map((commodity) => (
          <CommodityCard key={commodity.id} commodity={commodity} />
        ))}
      </div>
    </section>
  );
}
