import { MarketRegion } from './market';

export interface WatchlistItem {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
}

export type WatchlistData = Record<MarketRegion, WatchlistItem[]>;
