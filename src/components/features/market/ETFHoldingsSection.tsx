'use client';

/**
 * ETF 구성종목 섹션 컴포넌트
 *
 * ETF 상세 페이지에서 구성종목을 표시하는 섹션
 *
 * 기능:
 * - 상위 10개 구성종목 기본 표시
 * - "더보기" 클릭 시 전체 표시
 * - 각 구성종목 클릭 시 해당 종목 상세 페이지로 이동
 * - 로딩/에러 상태 처리
 *
 * 사용 위치:
 * - /market/[ticker] 페이지 (ETF인 경우)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useETFHoldings, ETFHolding } from '@/hooks/useETFHoldings';

// ==================== Props 인터페이스 ====================

interface ETFHoldingsSectionProps {
  /** ETF 심볼 (예: 'QQQ', 'SPY') */
  symbol: string;
}

// ==================== 스켈레톤 컴포넌트 ====================

/**
 * 구성종목 로딩 스켈레톤
 */
function HoldingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
            <div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          </div>
          <div className="h-5 w-12 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      ))}
    </div>
  );
}

// ==================== 개별 종목 행 컴포넌트 ====================

/**
 * 구성종목 개별 행 컴포넌트
 *
 * @param holding - 구성종목 데이터
 * @param rank - 순위 (1부터 시작)
 */
function HoldingRow({ holding, rank }: { holding: ETFHolding; rank: number }) {
  const router = useRouter();

  // 종목 클릭 시 해당 종목 상세 페이지로 이동
  const handleClick = () => {
    // BRK.B 같은 특수 심볼 처리
    const cleanSymbol = holding.symbol.replace('.', '-');
    router.push(`/market/${cleanSymbol}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* 순위 */}
        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
          {rank}
        </span>

        {/* 종목 정보 */}
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{holding.symbol}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{holding.name}</p>
        </div>
      </div>

      {/* 비중 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {holding.weight.toFixed(2)}%
        </span>
        {/* 비중 바 시각화 */}
        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
            style={{ width: `${Math.min(holding.weight * 5, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

/**
 * ETF 구성종목 섹션 메인 컴포넌트
 */
export function ETFHoldingsSection({ symbol }: ETFHoldingsSectionProps) {
  // 상태 관리
  const [isExpanded, setIsExpanded] = useState(false);

  // ETF 구성종목 데이터 조회
  const { data, holdings, isLoading, error, refetch } = useETFHoldings(symbol);

  // 데이터가 없으면 렌더링하지 않음
  if (!isLoading && !error && holdings.length === 0) {
    return null;
  }

  // 표시할 종목 수 결정 (기본 10개, 확장 시 전체)
  const displayHoldings = isExpanded ? holdings : holdings.slice(0, 10);
  const hasMore = holdings.length > 10;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">상위 구성종목</h2>
          {data && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {data.description} • 총 {data.totalHoldings}개 종목
            </p>
          )}
        </div>
        {data?.updatedAt && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {data.updatedAt} 기준
          </span>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && <HoldingsSkeleton />}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 구성종목 목록 */}
      {!isLoading && !error && holdings.length > 0 && (
        <>
          <div className="space-y-2">
            {displayHoldings.map((holding, idx) => (
              <HoldingRow key={holding.symbol} holding={holding} rank={idx + 1} />
            ))}
          </div>

          {/* 더보기/접기 버튼 */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
            >
              {isExpanded ? (
                <span className="flex items-center justify-center gap-1">
                  접기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  전체 {holdings.length}개 종목 보기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              )}
            </button>
          )}
        </>
      )}
    </section>
  );
}
