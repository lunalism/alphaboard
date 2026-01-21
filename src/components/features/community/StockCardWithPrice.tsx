'use client';

/**
 * StockCardWithPrice 컴포넌트
 *
 * 커뮤니티 피드에서 종목 태그를 표시하는 미니 카드입니다.
 * 실시간 시세 API를 호출하여 현재가와 등락률을 표시합니다.
 *
 * 기능:
 * - 티커 코드로 한국/미국 종목 자동 구분
 * - 실시간 시세 API 호출 (lazy loading)
 * - 로딩 중: 스켈레톤 UI
 * - API 실패 시: "시세 보기 →" 폴백
 * - 클릭 시: 종목 상세 페이지로 이동
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StockCardWithPriceProps {
  /** 종목 코드 (티커) */
  ticker: string;
  /** 종목명 */
  name: string;
}

// 한국 종목인지 확인 (6자리 숫자면 한국 종목)
const isKoreanStock = (ticker: string): boolean => {
  return /^\d{6}$/.test(ticker);
};

export function StockCardWithPrice({ ticker, name }: StockCardWithPriceProps) {
  const router = useRouter();

  // 가격 데이터 상태
  const [price, setPrice] = useState<number | null>(null);
  const [changePercent, setChangePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 종목 가격 조회
  useEffect(() => {
    const fetchPrice = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const isKR = isKoreanStock(ticker);
        const apiUrl = isKR
          ? `/api/kis/domestic/stock/price?symbol=${ticker}`
          : `/api/kis/overseas/stock/price?symbol=${ticker.toUpperCase()}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok && data.currentPrice !== undefined) {
          setPrice(data.currentPrice);
          setChangePercent(data.changePercent || 0);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
  }, [ticker]);

  const isPositive = (changePercent ?? 0) >= 0;
  const hasPrice = price !== null && !error;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/market/${ticker}`);
      }}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl
                 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-colors cursor-pointer"
    >
      {/* 종목 정보 */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
      </div>

      {/* 가격 영역 */}
      {isLoading ? (
        /* 로딩 중 - 스켈레톤 UI */
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
          <div className="w-12 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      ) : hasPrice ? (
        /* 가격 정보 있음 - 가격과 등락률 표시 */
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {isKoreanStock(ticker)
              ? price!.toLocaleString('ko-KR') + '원'
              : '$' + price!.toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {changePercent?.toFixed(2)}%
          </span>
          <span className="text-lg">{isPositive ? '📈' : '📉'}</span>
        </div>
      ) : (
        /* 가격 정보 없음/에러 - 시세 보기 링크 표시 */
        <span className="text-sm text-blue-600 dark:text-blue-400">
          시세 보기 →
        </span>
      )}
    </div>
  );
}
