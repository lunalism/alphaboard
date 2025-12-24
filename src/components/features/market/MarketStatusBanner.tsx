'use client';

/**
 * 시장 상태 배너 컴포넌트
 *
 * @description
 * 주식 시장의 현재 상태(개장/휴장/프리마켓/애프터마켓)를 표시합니다.
 * 휴장 시에는 마지막 거래일 기준 데이터임을 안내합니다.
 *
 * 표시 예시:
 * - 개장: "🟢 미국 시장 개장 중"
 * - 휴장: "⚪ 미국 시장 휴장 (2024-12-24 종가 기준)"
 * - 프리마켓: "🟡 프리마켓 진행 중 (정규장 09:30 개장)"
 *
 * @props
 * - market: 시장 코드 ('us' | 'kr')
 * - className: 추가 CSS 클래스
 */

import { useMemo } from 'react';
import {
  getUSMarketStatus,
  getKRMarketStatus,
  getMarketStatusColor,
  type MarketStatusInfo,
} from '@/lib/market-status';

interface MarketStatusBannerProps {
  /** 시장 코드 */
  market: 'us' | 'kr';
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 시장명 반환
 */
function getMarketName(market: 'us' | 'kr'): string {
  return market === 'us' ? '미국' : '한국';
}

/**
 * MarketStatusBanner 컴포넌트
 *
 * @example
 * <MarketStatusBanner market="us" />
 * <MarketStatusBanner market="kr" className="mb-4" />
 */
export function MarketStatusBanner({ market, className = '' }: MarketStatusBannerProps) {
  // 시장 상태 조회 (메모이제이션으로 불필요한 재계산 방지)
  const statusInfo: MarketStatusInfo = useMemo(() => {
    return market === 'us' ? getUSMarketStatus() : getKRMarketStatus();
  }, [market]);

  // 상태별 색상 클래스
  const colors = getMarketStatusColor(statusInfo.status);

  // 개장 중이면 배너 숨김 (선택적)
  // 개장 중에도 표시하려면 이 조건 제거
  // if (statusInfo.isOpen) {
  //   return null;
  // }

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl
        ${colors.bg} ${colors.text}
        ${className}
      `}
    >
      {/* 상태 표시 점 (애니메이션) */}
      <span className="relative flex h-2.5 w-2.5">
        {/* 개장 중일 때 펄스 애니메이션 */}
        {statusInfo.isOpen && (
          <span
            className={`
              animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
              ${colors.dot}
            `}
          />
        )}
        <span
          className={`
            relative inline-flex rounded-full h-2.5 w-2.5
            ${colors.dot}
          `}
        />
      </span>

      {/* 시장명 + 상태 라벨 */}
      <span className="font-medium">
        {getMarketName(market)} 시장 {statusInfo.label}
      </span>

      {/* 구분선 */}
      <span className="text-gray-300 dark:text-gray-600">|</span>

      {/* 상세 메시지 */}
      <span className="text-sm opacity-80">{statusInfo.message}</span>
    </div>
  );
}

/**
 * 간단한 시장 상태 뱃지 (컴팩트 버전)
 *
 * @description
 * 더 작은 공간에 표시할 때 사용하는 컴팩트 버전입니다.
 * 인덱스 카드 제목 옆에 표시하기 좋습니다.
 *
 * @example
 * <MarketStatusBadge market="us" />
 */
export function MarketStatusBadge({ market }: { market: 'us' | 'kr' }) {
  const statusInfo = useMemo(() => {
    return market === 'us' ? getUSMarketStatus() : getKRMarketStatus();
  }, [market]);

  const colors = getMarketStatusColor(statusInfo.status);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        ${colors.bg} ${colors.text}
      `}
    >
      {/* 상태 점 */}
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {statusInfo.label}
    </span>
  );
}

export default MarketStatusBanner;
