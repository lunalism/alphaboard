'use client';

/**
 * MarketTabs 컴포넌트
 * 국가 선택 탭 (한국/미국/일본/홍콩)
 *
 * @description
 * 시세 페이지에서 국가별 시장을 선택할 때 사용하는 탭 컴포넌트입니다.
 * 한국 서비스이므로 한국이 첫 번째로 표시됩니다.
 *
 * 요금제별 접근 제한:
 * - 무료 사용자: 한국 시장만 접근 가능
 * - 프리미엄 사용자: 모든 시장 접근 가능
 *
 * 레이아웃:
 * - 데스크톱: 시세 페이지 상단, 카테고리 탭과 같은 줄의 왼쪽에 배치
 * - 모바일: 카테고리 탭 위에 별도 줄로 배치, 가로 스크롤 지원
 *
 * 스타일:
 * - 활성 탭: 파란색 배경 + 흰색 텍스트 + 그림자
 * - 비활성 탭: 흰색/회색 배경 + 테두리 (다크모드 지원)
 * - 잠금 탭: 회색 배경 + 잠금 아이콘 + 왕관 표시
 *
 * @see /src/constants/market.ts - 탭 데이터 정의
 * @see /src/app/market/page.tsx - 사용처
 */

import { MarketRegion } from '@/types';
import { marketTabs } from '@/constants';
import { isPremiumOnlyMarket, type MarketCode } from '@/utils/subscription';

interface MarketTabsProps {
  /** 현재 선택된 국가 ('kr' | 'us' | 'jp' | 'hk') */
  activeMarket: MarketRegion;
  /** 국가 변경 시 호출되는 핸들러 */
  onMarketChange: (market: MarketRegion) => void;
  /** 프리미엄 사용자 여부 (기본값: false) */
  isPremium?: boolean;
}

export function MarketTabs({ activeMarket, onMarketChange, isPremium = false }: MarketTabsProps) {
  /**
   * 탭 클릭 핸들러
   * 프리미엄 전용 시장을 무료 사용자가 클릭하면 onMarketChange가 호출되어
   * 상위 컴포넌트에서 제한 처리 (토스트 표시 등)
   */
  const handleTabClick = (marketId: MarketRegion) => {
    onMarketChange(marketId);
  };

  return (
    // 가로 스크롤 가능한 탭 컨테이너
    // scrollbar-hide: 스크롤바 숨김 (모바일에서 깔끔한 UI)
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {marketTabs.map((tab) => {
        // 이 시장이 프리미엄 전용인지 확인
        const isLocked = !isPremium && isPremiumOnlyMarket(tab.id as MarketCode);
        const isActive = activeMarket === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              isActive
                // 활성화된 탭 스타일: 파란색 배경 + 그림자 효과
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : isLocked
                // 잠금 탭 스타일: 회색 배경 + 잠금 표시
                ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
                // 비활성화된 탭 스타일 (다크모드 지원)
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* 국기 이모지 - 잠금된 경우 투명도 낮춤 */}
            <span className={`text-lg ${isLocked ? 'opacity-50' : ''}`}>{tab.flag}</span>
            {/* 국가 레이블 */}
            <span>{tab.label}</span>
            {/* 잠금 아이콘 (프리미엄 전용 시장) */}
            {isLocked && (
              <span className="text-yellow-500 text-xs" title="프리미엄 전용">
                👑
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
