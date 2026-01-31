'use client';

/**
 * MarketTypeTabs 컴포넌트
 * 시세 페이지 최상단의 1차 탭
 * [국가별 시장] / [글로벌 시장] 선택
 * 세그먼트 버튼 스타일로 크고 눈에 띄게 구현
 *
 * 요금제별 접근 제한:
 * - 무료 사용자: 국가별 시장만 접근 가능
 * - 프리미엄 사용자: 모든 시장 접근 가능
 */

import { MarketType } from '@/types';
import { marketTypeTabs } from '@/constants';

interface MarketTypeTabsProps {
  // 현재 선택된 마켓 타입
  activeType: MarketType;
  // 마켓 타입 변경 핸들러
  onTypeChange: (type: MarketType) => void;
  // 프리미엄 사용자 여부 (기본값: false)
  isPremium?: boolean;
}

export function MarketTypeTabs({ activeType, onTypeChange, isPremium = false }: MarketTypeTabsProps) {
  return (
    // 세그먼트 버튼 컨테이너 - 다크모드 지원
    <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {marketTypeTabs.map((tab) => {
        // 글로벌 시장은 프리미엄 전용
        const isLocked = !isPremium && tab.id === 'global';
        const isActive = activeType === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTypeChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
              isActive
                // 활성화된 탭: 배경색 + 그림자
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                : isLocked
                // 잠금 탭: 회색 텍스트
                ? 'bg-transparent text-gray-400 dark:text-gray-500'
                // 비활성화된 탭: 투명 배경
                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {/* 아이콘 */}
            <span className={`text-xl ${isLocked ? 'opacity-50' : ''}`}>{tab.icon}</span>
            {/* 레이블 */}
            <span>{tab.label}</span>
            {/* 잠금 아이콘 (프리미엄 전용) */}
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
