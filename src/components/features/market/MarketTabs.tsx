'use client';

import { MarketRegion, MarketTab } from '@/types';
import { marketTabs } from '@/constants';

interface MarketTabsProps {
  activeMarket: MarketRegion;
  onMarketChange: (market: MarketRegion) => void;
}

export function MarketTabs({ activeMarket, onMarketChange }: MarketTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {marketTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onMarketChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
            activeMarket === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span className="text-lg">{tab.flag}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
