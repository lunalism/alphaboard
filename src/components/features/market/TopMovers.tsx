'use client';

import { TopMover } from '@/types';

interface TopMoversProps {
  gainers: TopMover[];
  losers: TopMover[];
}

function MoverList({ title, emoji, movers, isGainer }: {
  title: string;
  emoji: string;
  movers: TopMover[];
  isGainer: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>{emoji}</span>
        <span>{title}</span>
      </h3>
      <div className="space-y-3">
        {movers.map((mover, idx) => (
          <div
            key={mover.ticker}
            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                idx < 3
                  ? isGainer ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{mover.name}</p>
                <p className="text-xs text-gray-400 font-mono">{mover.ticker}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
              isGainer
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isGainer ? '+' : ''}{mover.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopMovers({ gainers, losers }: TopMoversProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MoverList title="상승 TOP 5" emoji="🔥" movers={gainers} isGainer={true} />
      <MoverList title="하락 TOP 5" emoji="💧" movers={losers} isGainer={false} />
    </div>
  );
}
