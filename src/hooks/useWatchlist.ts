'use client';

/**
 * useWatchlist 커스텀 훅
 *
 * @description
 * localStorage 기반 관심종목 관리 훅
 * - 관심종목 추가/제거/조회 기능 제공
 * - 여러 컴포넌트에서 재사용 가능
 * - SSR 호환 (클라이언트에서만 localStorage 접근)
 *
 * @usage
 * ```tsx
 * const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
 *
 * // 관심종목 추가
 * addToWatchlist({ ticker: '005930', name: '삼성전자', market: 'kr' });
 *
 * // 관심종목 제거
 * removeFromWatchlist('005930');
 *
 * // 관심종목 여부 확인
 * const isWatching = isInWatchlist('005930');
 * ```
 *
 * @localStorage
 * 키: "watchlist"
 * 형식: WatchlistItem[]
 */

import { useState, useEffect, useCallback } from 'react';

// ==================== 타입 정의 ====================

/**
 * 관심종목 아이템 인터페이스
 */
export interface WatchlistItem {
  /** 종목 티커 (예: "005930", "AAPL") */
  ticker: string;
  /** 종목명 (예: "삼성전자", "Apple Inc.") */
  name: string;
  /** 시장 구분 (kr: 한국, us: 미국, jp: 일본, hk: 홍콩) */
  market: 'kr' | 'us' | 'jp' | 'hk';
  /** 추가된 시간 (ISO 문자열) */
  addedAt?: string;
}

// ==================== 상수 ====================

/** localStorage 키 */
const WATCHLIST_STORAGE_KEY = 'watchlist';

// ==================== 유틸리티 함수 ====================

/**
 * localStorage에서 관심종목 불러오기
 * SSR 환경에서는 빈 배열 반환
 */
function loadWatchlist(): WatchlistItem[] {
  // SSR 환경 체크 (window가 없으면 서버 환경)
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // 배열인지 확인
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error('[useWatchlist] localStorage 로드 실패:', error);
    return [];
  }
}

/**
 * localStorage에 관심종목 저장
 */
function saveWatchlist(watchlist: WatchlistItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('[useWatchlist] localStorage 저장 실패:', error);
  }
}

// ==================== 훅 ====================

/**
 * 관심종목 관리 훅
 *
 * @returns 관심종목 상태 및 관리 함수
 */
export function useWatchlist() {
  // 관심종목 상태 (초기값은 빈 배열, 클라이언트에서 로드)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  // 로딩 상태 (초기 로드 완료 여부)
  const [isLoaded, setIsLoaded] = useState(false);

  // ========================================
  // 초기 로드: 클라이언트 마운트 시 localStorage에서 불러오기
  // ========================================
  useEffect(() => {
    const stored = loadWatchlist();
    setWatchlist(stored);
    setIsLoaded(true);
  }, []);

  // ========================================
  // 관심종목 추가
  // ========================================
  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    setWatchlist((prev) => {
      // 이미 존재하는지 확인
      const exists = prev.some((w) => w.ticker === item.ticker);
      if (exists) {
        console.log(`[useWatchlist] ${item.ticker}는 이미 관심종목에 있습니다.`);
        return prev;
      }

      // 새 아이템 추가
      const newItem: WatchlistItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };
      const updated = [...prev, newItem];

      // localStorage에 저장
      saveWatchlist(updated);
      console.log(`[useWatchlist] ${item.ticker} 관심종목 추가 완료`);

      return updated;
    });
  }, []);

  // ========================================
  // 관심종목 제거
  // ========================================
  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((w) => w.ticker !== ticker);

      // localStorage에 저장
      saveWatchlist(updated);
      console.log(`[useWatchlist] ${ticker} 관심종목 제거 완료`);

      return updated;
    });
  }, []);

  // ========================================
  // 관심종목 토글 (추가/제거)
  // ========================================
  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>) => {
      const exists = watchlist.some((w) => w.ticker === item.ticker);
      if (exists) {
        removeFromWatchlist(item.ticker);
        return false; // 제거됨
      } else {
        addToWatchlist(item);
        return true; // 추가됨
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist]
  );

  // ========================================
  // 관심종목 여부 확인
  // ========================================
  const isInWatchlist = useCallback(
    (ticker: string): boolean => {
      return watchlist.some((w) => w.ticker === ticker);
    },
    [watchlist]
  );

  // ========================================
  // 특정 시장의 관심종목 조회
  // ========================================
  const getWatchlistByMarket = useCallback(
    (market: 'kr' | 'us' | 'jp' | 'hk'): WatchlistItem[] => {
      return watchlist.filter((w) => w.market === market);
    },
    [watchlist]
  );

  // ========================================
  // 관심종목 전체 삭제
  // ========================================
  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    saveWatchlist([]);
    console.log('[useWatchlist] 관심종목 전체 삭제 완료');
  }, []);

  return {
    /** 전체 관심종목 목록 */
    watchlist,
    /** 초기 로드 완료 여부 */
    isLoaded,
    /** 관심종목 추가 */
    addToWatchlist,
    /** 관심종목 제거 */
    removeFromWatchlist,
    /** 관심종목 토글 (추가/제거) - 추가되면 true, 제거되면 false 반환 */
    toggleWatchlist,
    /** 관심종목 여부 확인 */
    isInWatchlist,
    /** 특정 시장의 관심종목 조회 */
    getWatchlistByMarket,
    /** 관심종목 전체 삭제 */
    clearWatchlist,
    /** 관심종목 개수 */
    count: watchlist.length,
  };
}
