import { MarketRegion } from './market';

export interface WatchlistItem {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  domain?: string; // Brandfetch 로고용 도메인 (예: 'apple.com')
}

export type WatchlistData = Record<MarketRegion, WatchlistItem[]>;
