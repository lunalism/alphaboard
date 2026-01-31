/**
 * 요금제 관련 유틸리티 함수
 *
 * 요금제별 기능 제한을 관리하는 유틸리티 모듈입니다.
 *
 * 요금제 구조:
 * - 무료 (free): 한국 시장만, 관심종목 3개, 알림 3개
 * - 프리미엄 (premium): 모든 시장, 무제한 관심종목/알림, AI 뉴스
 */

import { toast } from 'sonner';

// ============================================
// 타입 정의
// ============================================

/** 시장 타입 (국가/글로벌) */
export type MarketCode = 'kr' | 'us' | 'jp' | 'hk' | 'cn' | 'global';

/** 기능 제한 설정 */
export interface FeatureLimits {
  /** 접근 가능한 시장 목록 */
  accessibleMarkets: MarketCode[];
  /** 최대 관심종목 수 (Infinity = 무제한) */
  maxWatchlist: number;
  /** 최대 가격 알림 수 (Infinity = 무제한) */
  maxAlerts: number;
  /** AI 뉴스 분석 사용 가능 여부 */
  aiNewsAnalysis: boolean;
  /** 푸시 알림 사용 가능 여부 */
  pushNotification: boolean;
  /** 광고 없음 여부 */
  noAds: boolean;
}

// ============================================
// 상수
// ============================================

/** 무료 사용자 기능 제한 */
export const FREE_LIMITS: FeatureLimits = {
  accessibleMarkets: ['kr'],
  maxWatchlist: 3,
  maxAlerts: 3,
  aiNewsAnalysis: false,
  pushNotification: false,
  noAds: false,
};

/** 프리미엄 사용자 기능 제한 */
export const PREMIUM_LIMITS: FeatureLimits = {
  accessibleMarkets: ['kr', 'us', 'jp', 'hk', 'cn', 'global'],
  maxWatchlist: Infinity,
  maxAlerts: Infinity,
  aiNewsAnalysis: true,
  pushNotification: true,
  noAds: true,
};

/** 시장별 한글 이름 */
export const MARKET_NAMES: Record<MarketCode, string> = {
  kr: '한국',
  us: '미국',
  jp: '일본',
  hk: '홍콩',
  cn: '중국',
  global: '글로벌',
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 사용자의 기능 제한 설정을 반환합니다.
 *
 * @param isPremium - 프리미엄 사용자 여부
 * @returns 기능 제한 설정
 *
 * @example
 * const limits = getFeatureLimits(isPremium);
 * if (watchlist.length >= limits.maxWatchlist) {
 *   showPremiumRequired('관심종목');
 * }
 */
export function getFeatureLimits(isPremium: boolean): FeatureLimits {
  return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
}

/**
 * 특정 시장에 접근 가능한지 확인합니다.
 *
 * @param isPremium - 프리미엄 사용자 여부
 * @param market - 확인할 시장 코드
 * @returns 접근 가능 여부
 *
 * @example
 * if (!canAccessMarket(isPremium, 'us')) {
 *   showPremiumRequired('미국 시장');
 * }
 */
export function canAccessMarket(isPremium: boolean, market: MarketCode): boolean {
  const limits = getFeatureLimits(isPremium);
  return limits.accessibleMarkets.includes(market);
}

/**
 * 관심종목을 추가할 수 있는지 확인합니다.
 *
 * @param isPremium - 프리미엄 사용자 여부
 * @param currentCount - 현재 관심종목 수
 * @returns 추가 가능 여부
 *
 * @example
 * if (!canAddWatchlist(isPremium, watchlist.length)) {
 *   showPremiumRequired('관심종목');
 * }
 */
export function canAddWatchlist(isPremium: boolean, currentCount: number): boolean {
  const limits = getFeatureLimits(isPremium);
  return currentCount < limits.maxWatchlist;
}

/**
 * 가격 알림을 추가할 수 있는지 확인합니다.
 *
 * @param isPremium - 프리미엄 사용자 여부
 * @param currentCount - 현재 알림 수
 * @returns 추가 가능 여부
 *
 * @example
 * if (!canAddAlert(isPremium, alerts.length)) {
 *   showPremiumRequired('가격 알림');
 * }
 */
export function canAddAlert(isPremium: boolean, currentCount: number): boolean {
  const limits = getFeatureLimits(isPremium);
  return currentCount < limits.maxAlerts;
}

/**
 * 시장이 프리미엄 전용인지 확인합니다.
 *
 * @param market - 확인할 시장 코드
 * @returns 프리미엄 전용 여부
 */
export function isPremiumOnlyMarket(market: MarketCode): boolean {
  return !FREE_LIMITS.accessibleMarkets.includes(market);
}

// ============================================
// 프리미엄 유도 토스트 함수
// ============================================

/**
 * 프리미엄 전용 기능 토스트를 표시합니다.
 *
 * 업그레이드 버튼이 포함된 토스트를 표시합니다.
 * 버튼 클릭 시 가격 페이지로 이동합니다.
 *
 * @param featureName - 기능 이름 (예: "미국 시장", "관심종목")
 *
 * @example
 * showPremiumRequired('미국 시장');
 * // 토스트: "미국 시장은 프리미엄 전용입니다"
 */
export function showPremiumRequired(featureName?: string) {
  const message = featureName
    ? `${featureName}은(는) 프리미엄 전용입니다`
    : '프리미엄 전용 기능입니다';

  toast.info(message, {
    icon: '👑',
    description: '프리미엄으로 업그레이드하여 모든 기능을 이용하세요',
    action: {
      label: '업그레이드',
      onClick: () => {
        // 가격 페이지로 이동 (추후 구현)
        // window.location.href = '/pricing';
        toast.info('가격 페이지는 준비 중입니다', { icon: '🚧' });
      },
    },
    duration: 5000,
  });
}

/**
 * 관심종목 제한 초과 토스트를 표시합니다.
 *
 * @example
 * showWatchlistLimitReached();
 */
export function showWatchlistLimitReached() {
  toast.warning('무료 회원은 관심종목을 최대 3개까지 등록할 수 있습니다', {
    icon: '⭐',
    description: '프리미엄으로 업그레이드하면 무제한으로 등록 가능합니다',
    action: {
      label: '업그레이드',
      onClick: () => {
        toast.info('가격 페이지는 준비 중입니다', { icon: '🚧' });
      },
    },
    duration: 5000,
  });
}

/**
 * 가격 알림 제한 초과 토스트를 표시합니다.
 *
 * @example
 * showAlertLimitReached();
 */
export function showAlertLimitReached() {
  toast.warning('무료 회원은 가격 알림을 최대 3개까지 등록할 수 있습니다', {
    icon: '🔔',
    description: '프리미엄으로 업그레이드하면 무제한으로 등록 가능합니다',
    action: {
      label: '업그레이드',
      onClick: () => {
        toast.info('가격 페이지는 준비 중입니다', { icon: '🚧' });
      },
    },
    duration: 5000,
  });
}

/**
 * 시장 접근 제한 토스트를 표시합니다.
 *
 * @param market - 접근하려는 시장 코드
 *
 * @example
 * showMarketAccessDenied('us');
 * // 토스트: "미국 시장은 프리미엄 전용입니다"
 */
export function showMarketAccessDenied(market: MarketCode) {
  const marketName = MARKET_NAMES[market] || market;
  showPremiumRequired(`${marketName} 시장`);
}
