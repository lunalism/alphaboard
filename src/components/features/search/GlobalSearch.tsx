"use client";

/**
 * GlobalSearch 컴포넌트
 *
 * 데스크톱(lg 이상)에서 드롭다운 방식의 검색을 제공합니다.
 *
 * 동작:
 * - 검색창 포커스 시: 최근 본 종목 + 최근 검색어 드롭다운 표시
 * - 검색어 입력 시: 실시간 검색 결과 드롭다운 표시
 * - Enter 키: /search 페이지로 이동
 * - ESC 키: 드롭다운 닫기
 *
 * 사용처:
 * - 데스크톱 사이드바 (lg 이상)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useRecentSearches,
  useStockSearch,
  useRecentlyViewed,
  usePopularSearches,
  type StockSearchResult,
} from "@/hooks";
import type { MarketType } from "@/types/recentlyViewed";

// ==================== 상수 ====================

/** 드롭다운에 표시할 최대 개수 */
const DROPDOWN_LIMITS = {
  stocks: 5,
  recentlyViewed: 5,
  recentSearches: 5,
  popularSearches: 6,
};

// ==================== 유틸리티 함수 ====================

/**
 * 시장 배지 색상 반환
 */
function getMarketBadgeColor(market: MarketType): string {
  const colors: Record<MarketType, string> = {
    kr: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    us: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    jp: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    hk: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return colors[market] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

/**
 * 시장 라벨 반환
 */
function getMarketLabel(market: MarketType): string {
  const labels: Record<MarketType, string> = {
    kr: "KR",
    us: "US",
    jp: "JP",
    hk: "HK",
  };
  return labels[market] || market.toUpperCase();
}

// ==================== 컴포넌트 ====================

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 상태
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 훅
  const { recentSearches, isMounted, addSearch, removeSearch, clearAll } = useRecentSearches();
  const { recentlyViewed, isLoaded: isRecentlyViewedLoaded } = useRecentlyViewed();
  const { popularSearches } = usePopularSearches();
  const { results: stockResults, isLoading, search: searchStocks, clear: clearStockResults } = useStockSearch();

  // 제한된 데이터
  const limitedStockResults = stockResults.slice(0, DROPDOWN_LIMITS.stocks);
  const limitedRecentlyViewed = recentlyViewed.slice(0, DROPDOWN_LIMITS.recentlyViewed);
  const limitedRecentSearches = recentSearches.slice(0, DROPDOWN_LIMITS.recentSearches);
  const limitedPopularSearches = popularSearches.slice(0, DROPDOWN_LIMITS.popularSearches);

  // 최근 데이터 존재 여부
  const hasRecentData =
    (limitedRecentlyViewed.length > 0 || limitedRecentSearches.length > 0 || limitedPopularSearches.length > 0) &&
    isMounted &&
    isRecentlyViewedLoaded;

  // 검색 결과 모드 여부
  const isSearchMode = !!query.trim();

  /**
   * 입력값 변경 핸들러
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      searchStocks(value, { limit: DROPDOWN_LIMITS.stocks });
      setIsOpen(true);
    } else {
      clearStockResults();
      if (hasRecentData) {
        setIsOpen(true);
      }
    }
    setSelectedIndex(-1);
  };

  /**
   * 포커스 핸들러
   */
  const handleFocus = () => {
    if (query.trim() && stockResults.length > 0) {
      setIsOpen(true);
    } else if (!query.trim() && hasRecentData) {
      setIsOpen(true);
    }
  };

  /**
   * 블러 핸들러
   */
  const handleBlur = (e: React.FocusEvent) => {
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  /**
   * 드롭다운 닫기
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  /**
   * 검색 실행 (Enter 키 또는 검색 버튼)
   */
  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      addSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeDropdown();
    }
  }, [query, addSearch, router, closeDropdown]);

  /**
   * 종목 결과 클릭
   */
  const handleStockClick = (result: StockSearchResult) => {
    if (query.trim()) addSearch(query.trim());
    closeDropdown();
  };

  /**
   * 최근 검색어 클릭
   */
  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    addSearch(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeDropdown();
  };

  /**
   * 인기 검색어 클릭
   */
  const handlePopularSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    addSearch(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeDropdown();
  };

  /**
   * 최근 검색어 삭제
   */
  const handleRemoveRecentSearch = (e: React.MouseEvent, searchQuery: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeSearch(searchQuery);
  };

  /**
   * 키보드 네비게이션
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" && query.trim()) {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isSearchMode && selectedIndex >= 0 && limitedStockResults[selectedIndex]) {
          const result = limitedStockResults[selectedIndex];
          if (query.trim()) addSearch(query.trim());
          router.push(`/market/${result.symbol}?market=${result.type}`);
          closeDropdown();
        } else if (query.trim()) {
          handleSubmit();
        }
        break;

      case "Escape":
        closeDropdown();
        inputRef.current?.blur();
        break;

      case "ArrowDown":
        e.preventDefault();
        if (isSearchMode && limitedStockResults.length > 0) {
          setSelectedIndex((prev) => (prev < limitedStockResults.length - 1 ? prev + 1 : 0));
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isSearchMode && limitedStockResults.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : limitedStockResults.length - 1));
        }
        break;
    }
  };

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      clearStockResults();
    };
  }, [clearStockResults]);

  return (
    <div className="relative w-full">
      {/* 검색 입력창 */}
      <div className="relative">
        {/* 검색 아이콘 */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="종목명, 티커를 검색하세요"
          className="w-full pl-10 pr-8 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 outline-none"
        />

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* 검색어 지우기 버튼 */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              clearStockResults();
              if (hasRecentData) setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ========================================
          드롭다운
          ======================================== */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 max-h-[70vh] overflow-y-auto w-[350px] lg:w-[400px]"
        >
          {/* ========================================
              검색 결과 모드 (검색어가 있을 때)
              ======================================== */}
          {isSearchMode && (
            <>
              {/* 로딩 중 */}
              {isLoading && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  검색 중...
                </div>
              )}

              {/* 결과 없음 */}
              {!isLoading && limitedStockResults.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  &quot;{query}&quot;에 대한 검색 결과가 없습니다
                </div>
              )}

              {/* 종목 결과 */}
              {!isLoading && limitedStockResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">📈 종목</span>
                  </div>
                  {limitedStockResults.map((result, idx) => (
                    <Link
                      key={`stock-${result.symbol}-${idx}`}
                      href={`/market/${result.symbol}?market=${result.type}`}
                      onClick={() => handleStockClick(result)}
                      className={`flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === idx ? "bg-blue-50 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      {/* 종목 아이콘 */}
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {result.symbol.slice(0, 2)}
                      </div>
                      {/* 종목 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.symbol} · {result.type === "kr" ? result.market : result.exchange}
                        </p>
                      </div>
                      {/* 시장 배지 */}
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getMarketBadgeColor(result.type as MarketType)}`}>
                        {result.type === "kr" ? "KR" : "US"}
                      </span>
                    </Link>
                  ))}

                  {/* 더보기 버튼 */}
                  {stockResults.length > DROPDOWN_LIMITS.stocks && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => {
                        if (query.trim()) addSearch(query.trim());
                        closeDropdown();
                      }}
                      className="block px-3 py-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800 transition-colors"
                    >
                      전체 결과 보기 →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================
              초기 상태 모드 (검색어가 없을 때)
              - 최근 본 종목
              - 최근 검색어
              - 인기 검색어
              ======================================== */}
          {!isSearchMode && (
            <>
              {/* 최근 본 종목 */}
              {limitedRecentlyViewed.length > 0 && (
                <div className="border-b border-gray-100 dark:border-gray-800">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      👀 최근 본 종목
                    </span>
                  </div>
                  {/* 가로 스크롤 */}
                  <div className="p-3 overflow-x-auto scrollbar-hide">
                    <div className="flex flex-nowrap gap-2">
                      {limitedRecentlyViewed.map((stock) => (
                        <Link
                          key={`recent-stock-${stock.ticker}`}
                          href={`/market/${stock.ticker}?market=${stock.market}`}
                          onClick={closeDropdown}
                          className="flex-shrink-0 px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[120px] max-w-[160px]"
                        >
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded mb-1.5 ${getMarketBadgeColor(stock.market)}`}>
                            {getMarketLabel(stock.market)}
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {stock.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {stock.ticker}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 최근 검색어 */}
              {limitedRecentSearches.length > 0 && (
                <div className="border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      🕐 최근 검색어
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearAll();
                        if (limitedRecentlyViewed.length === 0 && limitedPopularSearches.length === 0) {
                          setIsOpen(false);
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="py-1">
                    {limitedRecentSearches.map((searchQuery, idx) => (
                      <div
                        key={`recent-search-${searchQuery}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleRecentSearchClick(searchQuery)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleRecentSearchClick(searchQuery);
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {searchQuery}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecentSearch(e, searchQuery)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              {limitedPopularSearches.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      🔥 인기 검색어
                    </span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-2">
                    {limitedPopularSearches.map((item) => (
                      <button
                        key={`popular-${item.query}`}
                        onClick={() => handlePopularSearchClick(item.query)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {item.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
