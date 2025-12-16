'use client';

/**
 * ETFContent 컴포넌트
 * ETF 카테고리 선택 시 표시되는 콘텐츠
 * 국가별 ETF를 카드 형태로 표시
 * - 미국: SPY, QQQ, IWM 등
 * - 한국: KODEX 200, TIGER 200 등
 * - 일본: NEXT FUNDS 日経225 등
 * - 홍콩: Tracker Fund, iShares China 등
 */

import { useRouter } from 'next/navigation';
import { ETF, MarketRegion } from '@/types';
import { etfData } from '@/constants';

interface ETFContentProps {
  // 현재 선택된 국가
  market: MarketRegion;
}

/**
 * 미니 차트 컴포넌트
 * ETF의 최근 가격 추이를 SVG 라인으로 시각화
 */
function MiniChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

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

/**
 * ETF 카드 컴포넌트
 * 개별 ETF 정보를 카드 형태로 표시
 */
function ETFCard({ etf, market }: { etf: ETF; market: MarketRegion }) {
  const router = useRouter();
  const isPositive = etf.change >= 0;

  /**
   * 국가별 가격 포맷팅
   * - 미국: $xxx.xx
   * - 한국: xxx,xxx원
   * - 일본: ¥xxx,xxx
   * - 홍콩: HK$xxx.xx
   */
  const formatPrice = (price: number) => {
    switch (market) {
      case 'kr':
        return price.toLocaleString('ko-KR') + '원';
      case 'jp':
        return '¥' + price.toLocaleString('ja-JP');
      case 'hk':
        return 'HK$' + price.toFixed(2);
      default:
        return '$' + price.toFixed(2);
    }
  };

  /**
   * 국가별 변동 포맷팅
   */
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    switch (market) {
      case 'kr':
        return sign + change.toLocaleString('ko-KR') + '원';
      case 'jp':
        return sign + '¥' + Math.abs(change).toLocaleString('ja-JP');
      case 'hk':
        return sign + 'HK$' + Math.abs(change).toFixed(2);
      default:
        return sign + '$' + Math.abs(change).toFixed(2);
    }
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => router.push(`/market/${etf.ticker}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 티커 + 미니차트 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* 티커 심볼 */}
          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg mb-2">
            {etf.ticker}
          </span>
          {/* ETF 이름 */}
          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{etf.name}</h3>
        </div>
        <MiniChart data={etf.chartData} isPositive={isPositive} />
      </div>

      {/* 가격 정보 */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(etf.price)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatChange(etf.change)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatPercent(etf.changePercent)}
          </span>
        </div>
      </div>

      {/* 추가 정보: AUM, 보수율 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">운용자산</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{etf.aum}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">보수율</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{etf.expenseRatio}</p>
        </div>
      </div>
    </div>
  );
}

export function ETFContent({ market }: ETFContentProps) {
  // 현재 선택된 국가의 ETF 데이터
  const currentETFs = etfData[market];

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        주요 ETF
      </h2>
      {/* ETF 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentETFs.map((etf) => (
          <ETFCard key={etf.id} etf={etf} market={market} />
        ))}
      </div>
    </section>
  );
}
