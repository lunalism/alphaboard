import { WatchlistData } from '@/types/watchlist';

export const watchlistData: WatchlistData = {
  us: [
    { id: 'aapl', name: 'Apple', ticker: 'AAPL', price: 248.13, change: -1.22, changePercent: -0.49, domain: 'apple.com' },
    { id: 'tsla', name: 'Tesla', ticker: 'TSLA', price: 424.77, change: 15.87, changePercent: 3.88, domain: 'tesla.com' },
    { id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', price: 134.25, change: -3.96, changePercent: -2.87, domain: 'nvidia.com' },
    { id: 'msft', name: 'Microsoft', ticker: 'MSFT', price: 448.29, change: -2.88, changePercent: -0.64, domain: 'microsoft.com' },
  ],
  kr: [
    { id: 'samsung', name: '삼성전자', ticker: '005930', price: 53600, change: 900, changePercent: 1.71, domain: 'samsung.com' },
    { id: 'skhynix', name: 'SK하이닉스', ticker: '000660', price: 171000, change: 6000, changePercent: 3.64, domain: 'skhynix.com' },
    { id: 'naver', name: 'NAVER', ticker: '035420', price: 189500, change: 2500, changePercent: 1.34, domain: 'navercorp.com' },
  ],
  jp: [
    { id: 'toyota', name: 'Toyota', ticker: '7203', price: 2847, change: 42, changePercent: 1.50, domain: 'toyota.com' },
    { id: 'sony', name: 'Sony', ticker: '6758', price: 3215, change: 58, changePercent: 1.84, domain: 'sony.com' },
  ],
  hk: [
    { id: 'tencent', name: 'Tencent', ticker: '0700', price: 408.60, change: 7.80, changePercent: 1.95, domain: 'tencent.com' },
    { id: 'alibaba', name: 'Alibaba', ticker: '9988', price: 88.35, change: 1.65, changePercent: 1.90, domain: 'alibaba.com' },
  ],
};
