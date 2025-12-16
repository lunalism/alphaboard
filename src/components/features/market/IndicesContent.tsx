'use client';

/**
 * IndicesContent 컴포넌트
 * 지수 카테고리 선택 시 표시되는 콘텐츠
 * 각 국가별 주요 지수를 카드 형태로 표시 (VIX 등 추가 지수 포함)
 */

import { MarketRegion, MarketIndex } from '@/types';
import { extendedIndices } from '@/constants';

interface IndicesContentProps {
  // 현재 선택된 국가
  market: MarketRegion;
}

/**
 * 미니 차트 컴포넌트
 * 지수의 최근 가격 추이를 SVG 라인으로 시각화
 */
function MiniChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // 데이터 포인트를 SVG 좌표로 변환
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-12" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/**
 * 지수 카드 컴포넌트
 * 개별 지수 정보를 카드 형태로 표시
 */
function IndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.change >= 0;

  // 숫자 포맷팅 함수들
  const formatValue = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* 지수 이름 */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{index.name}</h3>
          {/* 현재 값 */}
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatValue(index.value)}</p>
        </div>
        {/* 미니 차트 */}
        <MiniChart data={index.chartData} isPositive={isPositive} />
      </div>
      {/* 변동 정보 */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatChange(index.change)}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          isPositive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {formatPercent(index.changePercent)}
        </span>
      </div>
    </div>
  );
}

export function IndicesContent({ market }: IndicesContentProps) {
  // 현재 선택된 국가의 지수 데이터
  const indices = extendedIndices[market];

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        주요 지수
      </h2>
      {/* 지수 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {indices.map((index) => (
          <IndexCard key={index.id} index={index} />
        ))}
      </div>
    </section>
  );
}
