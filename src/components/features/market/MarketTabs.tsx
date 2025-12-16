'use client';

/**
 * MarketTabs 컴포넌트
 * 국가 선택 탭 (미국/한국/일본/홍콩)
 * 다크모드 지원
 */

import { MarketRegion, MarketTab } from '@/types';
import { marketTabs } from '@/constants';

interface MarketTabsProps {
  // 현재 선택된 국가
  activeMarket: MarketRegion;
  // 국가 변경 핸들러
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
              // 활성화된 탭 스타일
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              // 비활성화된 탭 스타일 (다크모드 지원)
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* 국기 이모지 */}
          <span className="text-lg">{tab.flag}</span>
          {/* 국가 레이블 */}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
