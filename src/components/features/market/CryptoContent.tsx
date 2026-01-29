'use client';

/**
 * CryptoContent 컴포넌트
 *
 * 암호화폐 카테고리 선택 시 표시되는 콘텐츠
 * BTC, ETH, SOL 등 주요 암호화폐를 카드 형태로 표시
 *
 * ============================================================
 * 데이터 소스:
 * ============================================================
 * - /api/crypto 엔드포인트 호출
 * - CoinGecko API를 통해 실시간 시세 조회
 * - API 실패 시 fallback 데이터 사용
 *
 * ============================================================
 * 표시 암호화폐:
 * ============================================================
 * - Bitcoin (BTC)
 * - Ethereum (ETH)
 * - Solana (SOL)
 * - XRP
 * - Cardano (ADA)
 * - Dogecoin (DOGE)
 * - Avalanche (AVAX)
 * - Chainlink (LINK)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// 상수 정의
// ============================================

/** 암호화폐 자동 새로고침 간격 (1분 = 60,000ms) */
const CRYPTO_REFRESH_INTERVAL = 60000;

// ============================================
// 타입 정의
// ============================================

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

/** API 응답 타입 */
interface CryptoAPIResponse {
  success: boolean;
  data: CryptoData[] | null;
  error?: string;
  timestamp: string;
  source: 'api' | 'fallback';
}

// ============================================
// 컴포넌트
// ============================================

/**
 * 미니 차트 컴포넌트
 * 암호화폐의 24시간 가격 추이를 SVG 라인으로 시각화
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
 * 암호화폐 카드 컴포넌트
 * 개별 암호화폐 정보를 카드 형태로 표시
 */
function CryptoCard({ crypto }: { crypto: CryptoData }) {
  const router = useRouter();
  const isPositive = crypto.changePercent24h >= 0;

  // 가격 포맷팅 (큰 숫자 처리)
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return '$' + price.toFixed(2);
    } else {
      return '$' + price.toFixed(4);
    }
  };

  // 변동 포맷팅
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    if (Math.abs(change) >= 1) {
      return sign + '$' + Math.abs(change).toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return sign + '$' + Math.abs(change).toFixed(4);
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => router.push(`/market/${crypto.symbol}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 아이콘 + 이름 + 심볼 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 암호화폐 아이콘 */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
            {crypto.icon}
          </div>
          <div>
            {/* 암호화폐 이름 */}
            <h3 className="font-semibold text-gray-900 dark:text-white">{crypto.name}</h3>
            {/* 심볼 */}
            <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
          </div>
        </div>
        {/* 미니 차트 */}
        <MiniChart data={crypto.chartData} isPositive={isPositive} />
      </div>

      {/* 가격 정보 */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(crypto.price)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatChange(crypto.change24h)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatPercent(crypto.changePercent24h)}
          </span>
          {/* 24시간 표시 */}
          <span className="text-xs text-gray-400 dark:text-gray-500">24h</span>
        </div>
      </div>

      {/* 추가 정보: 시가총액, 거래량 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">시가총액</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{crypto.marketCap}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">24h 거래량</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{crypto.volume24h}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function CryptoSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div>
                <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-28 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 암호화폐 콘텐츠 컴포넌트
 *
 * /api/crypto 엔드포인트를 통해 실시간 암호화폐 시세를 조회합니다.
 */
export function CryptoContent() {
  // 상태 관리
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 자동 새로고침 타이머 ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 암호화폐 데이터 로드 함수
   */
  const loadCryptoData = useCallback(async (isRefresh = false) => {
    // 초기 로드 시에만 로딩 표시
    if (!isRefresh) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/crypto', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data: CryptoAPIResponse = await response.json();

      if (data.success && data.data) {
        setCryptoList(data.data);
        setDataSource(data.source);
        setLastUpdated(new Date());

        if (isRefresh) {
          console.log('[CryptoContent] 암호화폐 자동 갱신 완료');
        } else {
          console.log('[CryptoContent] 암호화폐 데이터 로드 성공', {
            source: data.source,
            count: data.data.length,
          });
        }
      } else {
        throw new Error(data.error || '데이터 조회 실패');
      }
    } catch (err) {
      console.error('[CryptoContent] 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '암호화폐 데이터를 불러오는데 실패했습니다.');
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  }, []);

  // 초기 로드 및 자동 새로고침 설정
  useEffect(() => {
    // 초기 로드
    loadCryptoData(false);

    // 자동 새로고침 타이머 설정 (1분마다)
    refreshTimerRef.current = setInterval(() => {
      loadCryptoData(true);
    }, CRYPTO_REFRESH_INTERVAL);

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadCryptoData]);

  // 로딩 중
  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          암호화폐
        </h2>
        <CryptoSkeleton />
      </section>
    );
  }

  // 에러 상태
  if (error && cryptoList.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          암호화폐
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
            암호화폐
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
            {dataSource === 'api' ? '🪙 CoinGecko' : '📊 샘플 데이터'}
          </span>
          {dataSource === 'api' && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              실시간 시세
            </span>
          )}
        </div>
      </div>

      {/* 암호화폐 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cryptoList.map((crypto) => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </section>
  );
}
