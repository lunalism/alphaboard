'use client';

/**
 * GlobalETFContent 컴포넌트
 *
 * 글로벌 시장 > ETF 탭 선택 시 표시되는 콘텐츠
 *
 * ============================================================
 * 표시 ETF 목록 (초기 5개):
 * ============================================================
 * - QQQ (Invesco QQQ Trust) - 나스닥 100 추종
 * - SPY (SPDR S&P 500) - S&P 500 추종
 * - VOO (Vanguard S&P 500) - S&P 500 추종
 * - ARKK (ARK Innovation) - 혁신 기술 테마
 * - DIA (SPDR Dow Jones) - 다우존스 30 추종
 *
 * ============================================================
 * 데이터 소스:
 * ============================================================
 * - 한국투자증권 해외주식 API를 통한 실시간 시세 조회
 * - 클릭 시 /market/[symbol] 상세 페이지로 이동
 *
 * ============================================================
 * UI 구성:
 * ============================================================
 * - ETF 카드 그리드 (1~4열 반응형)
 * - 각 카드: 티커, ETF명, 한글 설명, 가격, 등락률, 미니차트
 * - 거래량 정보 표시
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUSETFs, USETFPriceData } from '@/hooks';

// ==================== 글로벌 ETF 목록 (5개) ====================
// 글로벌 시장에서 표시할 주요 ETF 심볼 목록
const GLOBAL_ETF_SYMBOLS = ['QQQ', 'SPY', 'VOO', 'ARKK', 'DIA'];

// ETF 한글 설명 매핑
const ETF_DESCRIPTIONS: Record<string, string> = {
  QQQ: '나스닥 100 추종 ETF',
  SPY: 'S&P 500 추종 ETF',
  VOO: 'Vanguard S&P 500 ETF',
  ARKK: '혁신 기술 테마 ETF',
  DIA: '다우존스 30 추종 ETF',
};

// ==================== 스켈레톤 컴포넌트 ====================

/**
 * ETF 카드 스켈레톤 (로딩 중 표시)
 *
 * 실제 ETF 카드와 동일한 레이아웃으로 shimmer 효과 적용
 */
function ETFCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      {/* 가격 스켈레톤 */}
      <div className="mb-3">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      {/* 하단 스켈레톤 */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * ETF 카드 스켈레톤 그리드
 *
 * @param count - 표시할 스켈레톤 카드 수 (기본: 5)
 */
function ETFSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ETFCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// ==================== 미니 차트 컴포넌트 ====================

/**
 * 미니 차트 컴포넌트
 *
 * ETF의 최근 가격 추이를 SVG 라인으로 시각화
 * 상승 시 녹색, 하락 시 빨간색
 *
 * @param data - 차트 데이터 배열 (숫자 9개)
 * @param isPositive - 상승 여부 (색상 결정용)
 */
function MiniChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  // 데이터 범위 계산 (최소~최대)
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // 0 방지

  // SVG polyline 포인트 생성
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ==================== 포맷팅 함수 ====================

/**
 * 가격 포맷팅 (USD)
 *
 * @param price - 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: $520.30)
 */
function formatPrice(price: number): string {
  return '$' + price.toFixed(2);
}

/**
 * 변동폭 포맷팅 (USD)
 *
 * @param change - 변동폭 (숫자)
 * @returns 포맷팅된 변동폭 문자열 (부호 포함)
 */
function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return sign + '$' + Math.abs(change).toFixed(2);
}

/**
 * 등락률 포맷팅
 *
 * @param percent - 등락률 (숫자)
 * @returns 퍼센트 문자열 (부호 포함)
 */
function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 거래량 포맷팅 (숫자 → 문자열)
 *
 * @param volume - 거래량 (숫자)
 * @returns 포맷팅된 거래량 문자열
 *
 * @example
 * formatVolume(365079995) → "365.1M"
 * formatVolume(1234567) → "1.2M"
 */
function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M';
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K';
  }
  return volume.toLocaleString('en-US');
}

/**
 * 차트 데이터 생성 (현재가 기준 가상 데이터)
 *
 * 실제 일별 시세 API가 없으므로, 현재가와 등락률을 기반으로
 * 9개의 데이터 포인트를 생성합니다.
 *
 * @param currentPrice - 현재가
 * @param changePercent - 등락률
 * @returns 차트 데이터 배열 (9개)
 */
function generateChartData(currentPrice: number, changePercent: number): number[] {
  const basePrice = currentPrice / (1 + changePercent / 100);
  const data: number[] = [];
  for (let i = 0; i < 9; i++) {
    const progress = i / 8;
    const noise = (Math.random() - 0.5) * 0.01 * currentPrice;
    const price = basePrice + (currentPrice - basePrice) * progress + noise;
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

// ==================== ETF 카드 컴포넌트 ====================

/**
 * 글로벌 ETF 카드 컴포넌트
 *
 * 한국투자증권 해외주식 API로 조회한 실시간 데이터를 표시
 *
 * 표시 정보:
 * - 티커 (심볼)
 * - ETF명
 * - 한글 설명
 * - 현재가, 등락폭, 등락률
 * - 거래량
 * - 미니 차트
 */
function GlobalETFCard({ etf }: { etf: USETFPriceData }) {
  const router = useRouter();
  const isPositive = etf.changePercent >= 0;

  // 차트 데이터 생성 (현재가 기반)
  const chartData = useMemo(
    () => generateChartData(etf.currentPrice, etf.changePercent),
    [etf.currentPrice, etf.changePercent]
  );

  // 한글 설명 가져오기
  const description = ETF_DESCRIPTIONS[etf.symbol] || etf.name;

  return (
    <div
      onClick={() => router.push(`/market/${etf.symbol}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700
                 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600
                 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 티커 + 미니차트 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* 티커 심볼 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🇺🇸</span>
            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg">
              {etf.symbol}
            </span>
          </div>
          {/* ETF 이름 */}
          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
            {etf.name}
          </h3>
          {/* 한글 설명 */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <MiniChart data={chartData} isPositive={isPositive} />
      </div>

      {/* 가격 정보 */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatPrice(etf.currentPrice)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-sm font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatChange(etf.change)}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {formatPercent(etf.changePercent)}
          </span>
        </div>
      </div>

      {/* 추가 정보: 거래량, 운용사 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">거래량</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatVolume(etf.volume)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">운용사</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{etf.issuer}</p>
        </div>
      </div>
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

/**
 * GlobalETFContent 메인 컴포넌트
 *
 * 글로벌 시장 > ETF 탭에서 주요 5개 ETF를 표시
 * 한국투자증권 해외주식 API를 통해 실시간 시세 조회
 */
export function GlobalETFContent() {
  // 미국 ETF 데이터 조회 (전체 카테고리)
  const { etfs: allUSETFs, isLoading, error, refetch } = useUSETFs('all');

  // 글로벌 ETF 목록에 해당하는 ETF만 필터링
  const globalETFs = useMemo(() => {
    if (!allUSETFs || allUSETFs.length === 0) return [];

    return GLOBAL_ETF_SYMBOLS.map((symbol) => allUSETFs.find((etf) => etf.symbol === symbol)).filter(
      (etf): etf is USETFPriceData => etf !== undefined
    );
  }, [allUSETFs]);

  return (
    <section>
      {/* 섹션 헤더: 제목 + 실시간 배지 */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        글로벌 ETF
        <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">실시간</span>
      </h2>

      {/* 설명 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        미국 대표 ETF를 통해 글로벌 시장에 투자하세요. 클릭하면 구성종목을 확인할 수 있습니다.
      </p>

      {/* 로딩 중: 스켈레톤 표시 */}
      {isLoading && <ETFSkeletonGrid count={5} />}

      {/* 에러 발생: 에러 메시지 + 재시도 버튼 */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 데이터 로드 완료: ETF 카드 그리드 */}
      {!isLoading && !error && globalETFs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {globalETFs.map((etf) => (
            <GlobalETFCard key={etf.symbol} etf={etf} />
          ))}
        </div>
      )}

      {/* 데이터 없음 */}
      {!isLoading && !error && globalETFs.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">ETF 데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </section>
  );
}
