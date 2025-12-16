'use client';

/**
 * CommodityContent 컴포넌트
 * 원자재 카테고리 선택 시 표시되는 콘텐츠
 * Gold, Silver, Crude Oil, Natural Gas, Copper 등 표시
 */

import { useRouter } from 'next/navigation';
import { Commodity } from '@/types';
import { commodityData } from '@/constants';

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
function CommodityCard({ commodity }: { commodity: Commodity }) {
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

export function CommodityContent() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        원자재
      </h2>
      {/* 원자재 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {commodityData.map((commodity) => (
          <CommodityCard key={commodity.id} commodity={commodity} />
        ))}
      </div>
    </section>
  );
}
