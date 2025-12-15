export type MarketRegion = 'us' | 'kr' | 'jp' | 'hk';

export interface MarketTab {
  id: MarketRegion;
  label: string;
  flag: string;
}

export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  chartData: number[];
}

export interface Stock {
  rank: number;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  domain?: string; // Brandfetch 로고용 도메인 (예: 'apple.com')
}

export interface TopMover {
  name: string;
  ticker: string;
  changePercent: number;
}
