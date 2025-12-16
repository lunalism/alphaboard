'use client';

/**
 * ForexContent 컴포넌트
 * 환율 카테고리 선택 시 표시되는 콘텐츠
 * USD/KRW, EUR/USD, USD/JPY, GBP/USD, DXY 등 표시
 */

import { useRouter } from 'next/navigation';
import { Forex } from '@/types';
import { forexData } from '@/constants';

/**
 * 미니 차트 컴포넌트
 * 환율의 최근 추이를 SVG 라인으로 시각화
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
 * 통화쌍별 국기 이모지 반환
 */
function getCurrencyFlags(pair: string): string {
  const flags: Record<string, string> = {
    'USD/KRW': '🇺🇸🇰🇷',
    'EUR/USD': '🇪🇺🇺🇸',
    'USD/JPY': '🇺🇸🇯🇵',
    'GBP/USD': '🇬🇧🇺🇸',
    'DXY': '🇺🇸',
    'USD/CNY': '🇺🇸🇨🇳',
    'EUR/JPY': '🇪🇺🇯🇵',
    'AUD/USD': '🇦🇺🇺🇸',
  };
  return flags[pair] || '💱';
}

/**
 * 환율 카드 컴포넌트
 * 개별 환율 정보를 카드 형태로 표시
 */
function ForexCard({ forex }: { forex: Forex }) {
  const router = useRouter();
  const isPositive = forex.change >= 0;

  // 환율 포맷팅 (소수점 자릿수 조정)
  const formatRate = (rate: number) => {
    if (rate >= 100) {
      return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (rate >= 1) {
      return rate.toFixed(4);
    } else {
      return rate.toFixed(4);
    }
  };

  // 변동 포맷팅
  const formatChange = (change: number, rate: number) => {
    const sign = change >= 0 ? '+' : '';
    if (rate >= 100) {
      return sign + change.toFixed(2);
    }
    return sign + change.toFixed(4);
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => router.push(`/market/${forex.id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 국기 + 통화쌍 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 국기 이모지 */}
          <div className="text-2xl">
            {getCurrencyFlags(forex.pair)}
          </div>
          <div>
            {/* 통화쌍 */}
            <h3 className="font-semibold text-gray-900 dark:text-white">{forex.pair}</h3>
            {/* 이름 */}
            <p className="text-sm text-gray-500 dark:text-gray-400">{forex.name}</p>
          </div>
        </div>
        {/* 미니 차트 */}
        <MiniChart data={forex.chartData} isPositive={isPositive} />
      </div>

      {/* 환율 정보 */}
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRate(forex.rate)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatChange(forex.change, forex.rate)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatPercent(forex.changePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ForexContent() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        환율
      </h2>
      {/* 환율 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {forexData.map((forex) => (
          <ForexCard key={forex.id} forex={forex} />
        ))}
      </div>
    </section>
  );
}
