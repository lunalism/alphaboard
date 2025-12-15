'use client';

import { useState } from 'react';
import { MarketRegion } from '@/types';
import { Sidebar, BottomNav } from '@/components/layout';
import { MarketTabs, IndexCard, StockTable, TopMovers } from '@/components/features/market';
import { marketIndices, popularStocks, topGainers, topLosers } from '@/constants';

export default function MarketPage() {
  const [activeMenu, setActiveMenu] = useState('market');
  const [activeMarket, setActiveMarket] = useState<MarketRegion>('us');

  const currentIndices = marketIndices[activeMarket];
  const currentStocks = popularStocks[activeMarket];
  const currentGainers = topGainers[activeMarket];
  const currentLosers = topLosers[activeMarket];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
      {/* Sidebar - hidden on mobile */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Bottom Navigation - visible only on mobile */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">시세</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">실시간 글로벌 시장 정보</p>
          </div>

          {/* Market Tabs */}
          <div className="mb-6">
            <MarketTabs activeMarket={activeMarket} onMarketChange={setActiveMarket} />
          </div>

          {/* Index Cards */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">주요 지수</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentIndices.map((index) => (
                <IndexCard key={index.id} index={index} />
              ))}
            </div>
          </section>

          {/* Popular Stocks */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">인기 종목</h2>
            <StockTable stocks={currentStocks} market={activeMarket} />
          </section>

          {/* Top Movers */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">등락률 TOP</h2>
            <TopMovers gainers={currentGainers} losers={currentLosers} />
          </section>
        </div>
      </main>
    </div>
  );
}
