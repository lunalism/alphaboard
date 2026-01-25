'use client';

/**
 * GlobalETFContent 컴포넌트
 *
 * 글로벌 시장 > ETF 탭 선택 시 표시되는 콘텐츠
 *
 * ============================================================
 * 레이아웃:
 * ============================================================
 * 1. 기본 상태: 2열 그리드 (컴팩트 카드)
 * 2. 선택 시 (데스크톱): 왼쪽에 구성종목, 오른쪽에 나머지 ETF 리스트
 * 3. 선택 시 (모바일): 세로 아코디언 방식
 *
 * ============================================================
 * 표시 ETF 목록 (20개):
 * ============================================================
 * 미국 ETF (10개): QQQ, SPY, VOO, ARKK, DIA, SOXX, SOXL, TQQQ, SCHD, VTI
 * 국내 상장 ETF (10개): 360750, 069500, 133690, 091160, 464440,
 *                      472160, 305720, 480360, 466920, 489250
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useUSETFs,
  useKoreanETFs,
  useETFHoldings,
  ETFHolding,
} from '@/hooks';

// ==================== ETF 목록 정의 ====================

// 미국 ETF 심볼 (10개)
const US_ETF_SYMBOLS = [
  'QQQ', 'SPY', 'VOO', 'ARKK', 'DIA',
  'SOXX', 'SOXL', 'TQQQ', 'SCHD', 'VTI',
];

// 국내 상장 ETF 심볼 (10개)
const KR_ETF_SYMBOLS = [
  '360750', '069500', '133690', '091160', '464440',
  '472160', '305720', '480360', '466920', '489250',
];

// ETF 한글 설명 매핑
const ETF_DESCRIPTIONS: Record<string, string> = {
  // 미국 ETF
  QQQ: '나스닥 100',
  SPY: 'S&P 500',
  VOO: 'S&P 500 뱅가드',
  ARKK: '혁신 기술',
  DIA: '다우존스 30',
  SOXX: '반도체',
  SOXL: '반도체 3X',
  TQQQ: '나스닥 3X',
  SCHD: '미국 배당',
  VTI: '전체 시장',
  // 국내 상장 ETF
  '360750': 'TIGER S&P500',
  '069500': 'KODEX 200',
  '133690': 'TIGER 나스닥',
  '091160': 'KODEX 반도체',
  '464440': 'PLUS K방산',
  '472160': 'HANARO 원자력',
  '305720': 'KODEX 2차전지',
  '480360': 'TIGER 로봇',
  '466920': 'SOL 조선',
  '489250': 'KODEX 배당',
};

// ==================== 통합 ETF 타입 ====================

interface UnifiedETFData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  isUS: boolean;
}

// ==================== 포맷팅 함수 ====================

function formatPrice(price: number, isUS: boolean): string {
  if (isUS) {
    return '$' + price.toFixed(2);
  }
  return price.toLocaleString('ko-KR') + '원';
}

function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

// ==================== 스켈레톤 컴포넌트 ====================

/**
 * 컴팩트 카드 스켈레톤
 */
function CompactCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * 스켈레톤 그리드 (2열)
 */
function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <CompactCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * 구성종목 스켈레톤
 */
function HoldingsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          <div className="h-4 w-10 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      ))}
    </div>
  );
}

// ==================== 컴팩트 ETF 카드 ====================

/**
 * 컴팩트 ETF 카드 (2열 그리드용)
 *
 * 간결한 정보 표시:
 * - 국기 + 심볼
 * - 한글 설명
 * - 현재가 + 등락률
 */
function CompactETFCard({
  etf,
  isSelected,
  onClick,
}: {
  etf: UnifiedETFData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isPositive = etf.changePercent >= 0;
  const description = ETF_DESCRIPTIONS[etf.symbol] || etf.name;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 border cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isSelected
          ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30 shadow-md'
          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
        }`}
    >
      {/* 상단: 국기 + 심볼 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{etf.isUS ? '🇺🇸' : '🇰🇷'}</span>
        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
          {etf.symbol}
        </span>
      </div>

      {/* 중간: 설명 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
        {description}
      </p>

      {/* 하단: 가격 + 등락률 */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-gray-900 dark:text-white">
          {formatPrice(etf.currentPrice, etf.isUS)}
        </span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {formatPercent(etf.changePercent)}
        </span>
      </div>
    </div>
  );
}

// ==================== 미니 ETF 카드 (사이드바용) ====================

/**
 * 미니 ETF 카드 (분할 뷰 오른쪽 리스트용)
 */
function MiniETFCard({
  etf,
  isSelected,
  onClick,
}: {
  etf: UnifiedETFData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isPositive = etf.changePercent >= 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer
        transition-all duration-150
        ${isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
    >
      {/* 왼쪽: 국기 + 심볼 */}
      <div className="flex items-center gap-2">
        <span className="text-xs">{etf.isUS ? '🇺🇸' : '🇰🇷'}</span>
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          {etf.symbol}
        </span>
      </div>

      {/* 오른쪽: 등락률 */}
      <span
        className={`text-xs font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}
      >
        {formatPercent(etf.changePercent)}
      </span>
    </div>
  );
}

// ==================== 구성종목 행 ====================

/**
 * 구성종목 개별 행
 */
function HoldingRow({
  holding,
  rank,
  onClick,
}: {
  holding: ETFHolding;
  rank: number;
  onClick: (symbol: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(holding.symbol)}
      className="flex items-center justify-between p-2 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
          {rank}
        </span>
        <div>
          <span className="font-medium text-gray-900 dark:text-white text-sm">{holding.symbol}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
            {holding.name}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {holding.weight.toFixed(1)}%
      </span>
    </div>
  );
}

// ==================== 선택된 ETF 상세 패널 ====================

/**
 * 선택된 ETF의 구성종목을 표시하는 상세 패널
 */
function SelectedETFPanel({
  etf,
  onClose,
  onDetailClick,
}: {
  etf: UnifiedETFData;
  onClose: () => void;
  onDetailClick: () => void;
}) {
  const router = useRouter();
  const isPositive = etf.changePercent >= 0;
  const description = ETF_DESCRIPTIONS[etf.symbol] || etf.name;

  // 구성종목 조회
  const { holdings, isLoading } = useETFHoldings(etf.symbol);

  // 구성종목 클릭 핸들러
  const handleHoldingClick = useCallback(
    (symbol: string) => {
      const cleanSymbol = symbol.replace('.', '-');
      router.push(`/market/${cleanSymbol}`);
    },
    [router]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{etf.isUS ? '🇺🇸' : '🇰🇷'}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-lg">
              {etf.symbol}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
          </div>
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 가격 정보 */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(etf.currentPrice, etf.isUS)}
          </span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-lg ${
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {formatPercent(etf.changePercent)}
          </span>
        </div>
      </div>

      {/* 구성종목 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            상위 구성종목
          </h4>
          <button
            onClick={onDetailClick}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400
                       hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            상세내용 확인
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 로딩 */}
        {isLoading && <HoldingsSkeleton />}

        {/* 구성종목 목록 */}
        {!isLoading && holdings.length > 0 && (
          <div className="space-y-1">
            {holdings.slice(0, 5).map((holding, idx) => (
              <HoldingRow
                key={holding.symbol}
                holding={holding}
                rank={idx + 1}
                onClick={handleHoldingClick}
              />
            ))}
          </div>
        )}

        {/* 데이터 없음 */}
        {!isLoading && holdings.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            구성종목 데이터가 없습니다.
          </p>
        )}

        {/* 더 보기 안내 */}
        {!isLoading && holdings.length > 5 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            외 {holdings.length - 5}개 종목 • 상세내용에서 전체 확인
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== 모바일 아코디언 카드 ====================

/**
 * 모바일용 아코디언 카드
 */
function MobileAccordionCard({
  etf,
  isExpanded,
  onToggle,
}: {
  etf: UnifiedETFData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const isPositive = etf.changePercent >= 0;
  const description = ETF_DESCRIPTIONS[etf.symbol] || etf.name;

  const { holdings, isLoading } = useETFHoldings(isExpanded ? etf.symbol : null);

  const handleHoldingClick = useCallback(
    (symbol: string) => {
      const cleanSymbol = symbol.replace('.', '-');
      router.push(`/market/${cleanSymbol}`);
    },
    [router]
  );

  const handleDetailClick = useCallback(() => {
    router.push(`/market/${etf.symbol}`);
  }, [router, etf.symbol]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all duration-200
        ${isExpanded
          ? 'border-blue-300 dark:border-blue-600 shadow-md'
          : 'border-gray-100 dark:border-gray-700'
        }`}
    >
      {/* 카드 헤더 */}
      <div onClick={onToggle} className="p-3 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{etf.isUS ? '🇺🇸' : '🇰🇷'}</span>
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded">
              {etf.symbol}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            {formatPrice(etf.currentPrice, etf.isUS)}
          </span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {formatPercent(etf.changePercent)}
          </span>
        </div>
      </div>

      {/* 아코디언 펼침 영역 */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">상위 구성종목</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDetailClick();
              }}
              className="text-xs text-blue-600 dark:text-blue-400"
            >
              상세 →
            </button>
          </div>

          {isLoading && <HoldingsSkeleton />}

          {!isLoading && holdings.length > 0 && (
            <div className="space-y-1">
              {holdings.slice(0, 5).map((holding, idx) => (
                <HoldingRow
                  key={holding.symbol}
                  holding={holding}
                  rank={idx + 1}
                  onClick={handleHoldingClick}
                />
              ))}
            </div>
          )}

          {!isLoading && holdings.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

/**
 * GlobalETFContent 메인 컴포넌트
 *
 * 레이아웃:
 * - 기본: 2열 그리드 (컴팩트 카드)
 * - 선택 시 (데스크톱): 왼쪽 구성종목 + 오른쪽 ETF 리스트
 * - 선택 시 (모바일): 아코디언 방식
 */
export function GlobalETFContent() {
  const router = useRouter();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  // 미국 ETF 데이터 조회
  const { etfs: allUSETFs, isLoading: isUSLoading, error: usError, refetch: refetchUS } = useUSETFs('all');

  // 국내 ETF 데이터 조회
  const { etfs: allKRETFs, isLoading: isKRLoading, error: krError, refetch: refetchKR } = useKoreanETFs('all');

  const isLoading = isUSLoading || isKRLoading;
  const error = usError || krError;

  // 미국 ETF 필터링
  const usETFs: UnifiedETFData[] = useMemo(() => {
    if (!allUSETFs || allUSETFs.length === 0) return [];
    return US_ETF_SYMBOLS
      .map((symbol) => {
        const etf = allUSETFs.find((e) => e.symbol === symbol);
        if (!etf) return null;
        return {
          symbol: etf.symbol,
          name: etf.name,
          currentPrice: etf.currentPrice,
          change: etf.change,
          changePercent: etf.changePercent,
          isUS: true,
        };
      })
      .filter((etf): etf is UnifiedETFData => etf !== null);
  }, [allUSETFs]);

  // 국내 ETF 필터링
  const krETFs: UnifiedETFData[] = useMemo(() => {
    if (!allKRETFs || allKRETFs.length === 0) return [];
    return KR_ETF_SYMBOLS
      .map((symbol) => {
        const etf = allKRETFs.find((e) => e.symbol === symbol);
        if (!etf) return null;
        return {
          symbol: etf.symbol,
          name: etf.name,
          currentPrice: etf.currentPrice,
          change: etf.change,
          changePercent: etf.changePercent,
          isUS: false,
        };
      })
      .filter((etf): etf is UnifiedETFData => etf !== null);
  }, [allKRETFs]);

  // 전체 ETF 목록
  const allETFs = useMemo(() => [...usETFs, ...krETFs], [usETFs, krETFs]);

  // 선택된 ETF
  const selectedETF = useMemo(
    () => allETFs.find((etf) => etf.symbol === selectedSymbol) || null,
    [allETFs, selectedSymbol]
  );

  // ETF 선택/해제 핸들러
  const handleSelect = useCallback((symbol: string) => {
    setSelectedSymbol((prev) => (prev === symbol ? null : symbol));
  }, []);

  // 상세 페이지 이동
  const handleDetailClick = useCallback(() => {
    if (selectedSymbol) {
      router.push(`/market/${selectedSymbol}`);
    }
  }, [router, selectedSymbol]);

  // 새로고침
  const handleRefetch = useCallback(() => {
    refetchUS();
    refetchKR();
  }, [refetchUS, refetchKR]);

  return (
    <section>
      {/* 헤더 */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        글로벌 ETF
        <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">실시간</span>
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        카드를 클릭하면 구성종목을 확인할 수 있습니다. (총 {allETFs.length}개)
      </p>

      {/* 로딩 */}
      {isLoading && <SkeletonGrid count={10} />}

      {/* 에러 */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefetch}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* ==================== 데스크톱 레이아웃 ==================== */}
      {!isLoading && !error && allETFs.length > 0 && (
        <div className="hidden md:block">
          {selectedETF ? (
            // 분할 뷰: 왼쪽 상세 + 오른쪽 리스트
            <div className="flex gap-4">
              {/* 왼쪽: 선택된 ETF 상세 (60%) */}
              <div className="flex-[3]">
                <SelectedETFPanel
                  etf={selectedETF}
                  onClose={() => setSelectedSymbol(null)}
                  onDetailClick={handleDetailClick}
                />
              </div>

              {/* 오른쪽: 나머지 ETF 리스트 (40%) */}
              <div className="flex-[2] bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 max-h-[500px] overflow-y-auto">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
                  다른 ETF ({allETFs.length - 1}개)
                </p>
                <div className="space-y-1">
                  {allETFs
                    .filter((etf) => etf.symbol !== selectedSymbol)
                    .map((etf) => (
                      <MiniETFCard
                        key={etf.symbol}
                        etf={etf}
                        isSelected={false}
                        onClick={() => handleSelect(etf.symbol)}
                      />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            // 2열 그리드 뷰
            <>
              {/* 미국 ETF */}
              {usETFs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span>🇺🇸</span> 미국 ETF ({usETFs.length}개)
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {usETFs.map((etf) => (
                      <CompactETFCard
                        key={etf.symbol}
                        etf={etf}
                        isSelected={selectedSymbol === etf.symbol}
                        onClick={() => handleSelect(etf.symbol)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 국내 ETF */}
              {krETFs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span>🇰🇷</span> 국내 상장 ETF ({krETFs.length}개)
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {krETFs.map((etf) => (
                      <CompactETFCard
                        key={etf.symbol}
                        etf={etf}
                        isSelected={selectedSymbol === etf.symbol}
                        onClick={() => handleSelect(etf.symbol)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== 모바일 레이아웃 ==================== */}
      {!isLoading && !error && allETFs.length > 0 && (
        <div className="md:hidden">
          {/* 미국 ETF */}
          {usETFs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <span>🇺🇸</span> 미국 ETF
              </h3>
              <div className="space-y-2">
                {usETFs.map((etf) => (
                  <MobileAccordionCard
                    key={etf.symbol}
                    etf={etf}
                    isExpanded={selectedSymbol === etf.symbol}
                    onToggle={() => handleSelect(etf.symbol)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 국내 ETF */}
          {krETFs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <span>🇰🇷</span> 국내 상장 ETF
              </h3>
              <div className="space-y-2">
                {krETFs.map((etf) => (
                  <MobileAccordionCard
                    key={etf.symbol}
                    etf={etf}
                    isExpanded={selectedSymbol === etf.symbol}
                    onToggle={() => handleSelect(etf.symbol)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 데이터 없음 */}
      {!isLoading && !error && allETFs.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">ETF 데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </section>
  );
}
