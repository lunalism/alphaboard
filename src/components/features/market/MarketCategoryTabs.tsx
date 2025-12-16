'use client';

/**
 * MarketCategoryTabs 컴포넌트
 * 시세 페이지의 카테고리 탭
 *
 * 마켓 타입에 따라 다른 카테고리 표시:
 * - 국가별 시장: 전체 / 지수 / 주식 / ETF
 * - 글로벌 시장: 전체 / 암호화폐 / 원자재 / 환율
 */

import { MarketCategory, MarketType } from '@/types';
import { countryCategoryTabs, globalCategoryTabs } from '@/constants';

interface MarketCategoryTabsProps {
  // 현재 마켓 타입 (국가별/글로벌)
  marketType: MarketType;
  // 현재 선택된 카테고리
  activeCategory: MarketCategory;
  // 카테고리 변경 핸들러
  onCategoryChange: (category: MarketCategory) => void;
}

export function MarketCategoryTabs({
  marketType,
  activeCategory,
  onCategoryChange
}: MarketCategoryTabsProps) {
  // 마켓 타입에 따라 표시할 카테고리 탭 선택
  const tabs = marketType === 'country' ? countryCategoryTabs : globalCategoryTabs;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onCategoryChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeCategory === tab.id
              // 활성화된 탭 스타일 (다크모드 지원)
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              // 비활성화된 탭 스타일 (다크모드 지원)
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          {/* 카테고리 아이콘 */}
          <span className="text-base">{tab.icon}</span>
          {/* 카테고리 레이블 */}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
