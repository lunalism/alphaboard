'use client';

/**
 * GlobalOverviewContent 컴포넌트
 * 글로벌 시장 > 전체 카테고리 선택 시 표시되는 콘텐츠
 * 암호화폐, 원자재, 환율의 요약 정보를 한 페이지에 표시
 */

import { cryptoData, commodityData, forexData } from '@/constants';

/**
 * 미니 차트 컴포넌트
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
 * 암호화폐 요약 섹션
 * 상위 4개 암호화폐 표시
 */
function CryptoSummary() {
  const topCryptos = cryptoData.slice(0, 4);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return '$' + price.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

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
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{crypto.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{crypto.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={crypto.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatPrice(crypto.price)}</p>
                  <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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

/**
 * 원자재 요약 섹션
 * 상위 4개 원자재 표시
 */
function CommoditySummary() {
  const topCommodities = commodityData.slice(0, 4);

  const getCommodityIcon = (id: string): string => {
    const icons: Record<string, string> = {
      gold: '🥇',
      silver: '🥈',
      oil: '🛢️',
      brent: '🛢️',
      natgas: '🔥',
      copper: '🔶',
    };
    return icons[id] || '📦';
  };

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🛢️</span>
        <span>원자재</span>
      </h3>
      <div className="space-y-3">
        {topCommodities.map((commodity) => {
          const isPositive = commodity.change >= 0;
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
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{commodity.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{commodity.symbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={commodity.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatPrice(commodity.price)}</p>
                  <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
 * 환율 요약 섹션
 * 상위 4개 환율 표시
 */
function ForexSummary() {
  const topForex = forexData.slice(0, 4);

  const getCurrencyFlags = (pair: string): string => {
    const flags: Record<string, string> = {
      'USD/KRW': '🇺🇸🇰🇷',
      'EUR/USD': '🇪🇺🇺🇸',
      'USD/JPY': '🇺🇸🇯🇵',
      'GBP/USD': '🇬🇧🇺🇸',
      'DXY': '🇺🇸',
    };
    return flags[pair] || '💱';
  };

  const formatRate = (rate: number) => {
    if (rate >= 100) {
      return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return rate.toFixed(4);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>💱</span>
        <span>환율</span>
      </h3>
      <div className="space-y-3">
        {topForex.map((forex) => {
          const isPositive = forex.change >= 0;
          return (
            <div
              key={forex.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">
                  {getCurrencyFlags(forex.pair)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{forex.pair}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{forex.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniChart data={forex.chartData} isPositive={isPositive} />
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatRate(forex.rate)}</p>
                  <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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

export function GlobalOverviewContent() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        글로벌 시장 요약
      </h2>
      {/* 3열 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CryptoSummary />
        <CommoditySummary />
        <ForexSummary />
      </div>
    </section>
  );
}
