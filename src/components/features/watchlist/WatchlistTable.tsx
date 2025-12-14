'use client';

import { WatchlistItem, MarketRegion } from '@/types';

interface WatchlistTableProps {
  items: WatchlistItem[];
  market: MarketRegion;
  onDelete: (id: string) => void;
}

export function WatchlistTable({ items, market, onDelete }: WatchlistTableProps) {
  const formatPrice = (price: number) => {
    if (market === 'kr') {
      return price.toLocaleString('ko-KR') + '원';
    } else if (market === 'jp') {
      return '¥' + price.toLocaleString('ja-JP');
    } else if (market === 'hk') {
      return 'HK$' + price.toFixed(2);
    }
    return '$' + price.toFixed(2);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    if (market === 'kr') {
      return sign + change.toLocaleString('ko-KR');
    }
    return sign + change.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⭐</span>
        </div>
        <p className="text-gray-500">
          아직 관심종목이 없어요.<br />
          종목을 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">종목명</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">티커</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">현재가</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">등락률</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">등락폭</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isPositive = item.changePercent >= 0;
              return (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-500 text-sm font-mono">{item.ticker}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {formatPercent(item.changePercent)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatChange(item.change)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
