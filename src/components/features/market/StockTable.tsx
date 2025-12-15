'use client';

import { Stock, MarketRegion } from '@/types';
import { CompanyLogo } from '@/components/common';

interface StockTableProps {
  stocks: Stock[];
  market: MarketRegion;
}

export function StockTable({ stocks, market }: StockTableProps) {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">순위</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">종목명</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">티커</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">현재가</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">등락률</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">거래량</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              return (
                <tr
                  key={stock.ticker}
                  className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      stock.rank <= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {stock.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <CompanyLogo domain={stock.domain} size="sm" />
                      <span className="font-medium text-gray-900">{stock.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-500 text-sm font-mono">{stock.ticker}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">{formatPrice(stock.price)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatChange(stock.change)}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-gray-500 text-sm">{stock.volume}</span>
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
