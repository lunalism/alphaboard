'use client';

/**
 * CryptoContent 컴포넌트
 * 암호화폐 카테고리 선택 시 표시되는 콘텐츠
 * BTC, ETH, SOL 등 주요 암호화폐를 카드 형태로 표시
 * 24시간 변동률 표시
 */

import { useRouter } from 'next/navigation';
import { Crypto } from '@/types';
import { cryptoData } from '@/constants';

/**
 * 미니 차트 컴포넌트
 * 암호화폐의 24시간 가격 추이를 SVG 라인으로 시각화
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
    <svg viewBox="0 0 100 100" className="w-20 h-10" preserveAspectRatio="none">
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
 * 암호화폐 카드 컴포넌트
 * 개별 암호화폐 정보를 카드 형태로 표시
 */
function CryptoCard({ crypto }: { crypto: Crypto }) {
  const router = useRouter();
  const isPositive = crypto.changePercent24h >= 0;

  // 가격 포맷팅 (큰 숫자 처리)
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return '$' + price.toFixed(2);
    } else {
      return '$' + price.toFixed(4);
    }
  };

  // 변동 포맷팅
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    if (Math.abs(change) >= 1) {
      return sign + '$' + Math.abs(change).toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return sign + '$' + Math.abs(change).toFixed(4);
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div
      onClick={() => router.push(`/market/${crypto.symbol}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* 헤더: 아이콘 + 이름 + 심볼 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 암호화폐 아이콘 */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
            {crypto.icon}
          </div>
          <div>
            {/* 암호화폐 이름 */}
            <h3 className="font-semibold text-gray-900 dark:text-white">{crypto.name}</h3>
            {/* 심볼 */}
            <p className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
          </div>
        </div>
        {/* 미니 차트 */}
        <MiniChart data={crypto.chartData} isPositive={isPositive} />
      </div>

      {/* 가격 정보 */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(crypto.price)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatChange(crypto.change24h)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatPercent(crypto.changePercent24h)}
          </span>
          {/* 24시간 표시 */}
          <span className="text-xs text-gray-400 dark:text-gray-500">24h</span>
        </div>
      </div>

      {/* 추가 정보: 시가총액, 거래량 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">시가총액</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{crypto.marketCap}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">24h 거래량</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{crypto.volume24h}</p>
        </div>
      </div>
    </div>
  );
}

export function CryptoContent() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        암호화폐
      </h2>
      {/* 암호화폐 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cryptoData.map((crypto) => (
          <CryptoCard key={crypto.id} crypto={crypto} />
        ))}
      </div>
    </section>
  );
}
