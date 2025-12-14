import { MarketTab, MarketIndex, Stock, TopMover, MarketRegion } from '@/types/market';

// 2024년 12월 12일 기준 실제 시장 데이터

export const marketTabs: MarketTab[] = [
  { id: 'us', label: '미국', flag: '🇺🇸' },
  { id: 'kr', label: '한국', flag: '🇰🇷' },
  { id: 'jp', label: '일본', flag: '🇯🇵' },
  { id: 'hk', label: '홍콩', flag: '🇭🇰' },
];

export const marketIndices: Record<MarketRegion, MarketIndex[]> = {
  us: [
    { id: 'spx', name: 'S&P 500', value: 6084.19, change: -17.48, changePercent: -0.29, chartData: [6090, 6095, 6088, 6092, 6085, 6080, 6078, 6082, 6084] },
    { id: 'ndx', name: 'NASDAQ', value: 19902.84, change: -123.08, changePercent: -0.61, chartData: [20050, 20020, 19980, 19950, 19920, 19890, 19870, 19890, 19903] },
    { id: 'dji', name: 'Dow Jones', value: 43914.12, change: -234.44, changePercent: -0.53, chartData: [44200, 44150, 44100, 44050, 44000, 43950, 43920, 43900, 43914] },
    { id: 'rut', name: 'Russell 2000', value: 2366.79, change: -33.42, changePercent: -1.39, chartData: [2410, 2400, 2390, 2380, 2375, 2370, 2365, 2368, 2367] },
  ],
  kr: [
    { id: 'kospi', name: 'KOSPI', value: 2482.12, change: 39.61, changePercent: 1.62, chartData: [2442, 2450, 2458, 2465, 2470, 2475, 2478, 2480, 2482] },
    { id: 'kosdaq', name: 'KOSDAQ', value: 683.35, change: 7.43, changePercent: 1.10, chartData: [676, 677, 678, 679, 680, 681, 682, 683, 683] },
  ],
  jp: [
    { id: 'n225', name: 'Nikkei 225', value: 39849.14, change: 476.91, changePercent: 1.21, chartData: [39350, 39450, 39520, 39600, 39680, 39750, 39800, 39830, 39849] },
    { id: 'topix', name: 'TOPIX', value: 2773.03, change: 30.42, changePercent: 1.11, chartData: [2740, 2748, 2752, 2758, 2762, 2768, 2770, 2772, 2773] },
  ],
  hk: [
    { id: 'hsi', name: 'Hang Seng', value: 20397.01, change: 242.36, changePercent: 1.20, chartData: [20150, 20180, 20220, 20260, 20300, 20340, 20370, 20390, 20397] },
    { id: 'hscei', name: 'HSCEI', value: 7286.76, change: 101.64, changePercent: 1.41, chartData: [7180, 7200, 7220, 7240, 7260, 7270, 7280, 7284, 7287] },
  ],
};

export const popularStocks: Record<MarketRegion, Stock[]> = {
  us: [
    { rank: 1, name: 'NVIDIA', ticker: 'NVDA', price: 134.25, change: -3.96, changePercent: -2.87, volume: '326.8M' },
    { rank: 2, name: 'Tesla', ticker: 'TSLA', price: 424.77, change: 15.87, changePercent: 3.88, volume: '112.4M' },
    { rank: 3, name: 'Apple', ticker: 'AAPL', price: 248.13, change: -1.22, changePercent: -0.49, volume: '45.2M' },
    { rank: 4, name: 'Microsoft', ticker: 'MSFT', price: 448.29, change: -2.88, changePercent: -0.64, volume: '18.7M' },
    { rank: 5, name: 'Alphabet', ticker: 'GOOGL', price: 193.95, change: -1.48, changePercent: -0.76, volume: '22.4M' },
    { rank: 6, name: 'Amazon', ticker: 'AMZN', price: 227.03, change: -0.92, changePercent: -0.40, volume: '38.6M' },
    { rank: 7, name: 'Meta', ticker: 'META', price: 617.12, change: -5.34, changePercent: -0.86, volume: '12.8M' },
    { rank: 8, name: 'Broadcom', ticker: 'AVGO', price: 186.24, change: -4.16, changePercent: -2.18, volume: '24.1M' },
  ],
  kr: [
    { rank: 1, name: '삼성전자', ticker: '005930', price: 53600, change: 900, changePercent: 1.71, volume: '15.2M' },
    { rank: 2, name: 'SK하이닉스', ticker: '000660', price: 171000, change: 6000, changePercent: 3.64, volume: '2.6M' },
    { rank: 3, name: 'LG에너지솔루션', ticker: '373220', price: 366500, change: 4500, changePercent: 1.24, volume: '0.4M' },
    { rank: 4, name: '현대차', ticker: '005380', price: 211000, change: 3500, changePercent: 1.69, volume: '0.9M' },
    { rank: 5, name: '기아', ticker: '000270', price: 95200, change: 1600, changePercent: 1.71, volume: '1.4M' },
    { rank: 6, name: '셀트리온', ticker: '068270', price: 181500, change: 2000, changePercent: 1.11, volume: '0.8M' },
    { rank: 7, name: 'NAVER', ticker: '035420', price: 189500, change: 2500, changePercent: 1.34, volume: '0.6M' },
    { rank: 8, name: '카카오', ticker: '035720', price: 41550, change: 650, changePercent: 1.59, volume: '2.3M' },
  ],
  jp: [
    { rank: 1, name: 'Toyota', ticker: '7203', price: 2847, change: 42, changePercent: 1.50, volume: '18.4M' },
    { rank: 2, name: 'Sony', ticker: '6758', price: 3215, change: 58, changePercent: 1.84, volume: '9.2M' },
    { rank: 3, name: 'Keyence', ticker: '6861', price: 65780, change: 980, changePercent: 1.51, volume: '0.5M' },
    { rank: 4, name: 'SoftBank', ticker: '9984', price: 9125, change: 142, changePercent: 1.58, volume: '14.6M' },
    { rank: 5, name: 'Nintendo', ticker: '7974', price: 9012, change: 87, changePercent: 0.97, volume: '3.8M' },
    { rank: 6, name: 'Fast Retailing', ticker: '9983', price: 51240, change: 640, changePercent: 1.26, volume: '0.7M' },
    { rank: 7, name: 'Tokyo Electron', ticker: '8035', price: 24680, change: 420, changePercent: 1.73, volume: '2.1M' },
    { rank: 8, name: 'Mitsubishi UFJ', ticker: '8306', price: 1842, change: 28, changePercent: 1.54, volume: '52.3M' },
  ],
  hk: [
    { rank: 1, name: 'Tencent', ticker: '0700', price: 408.60, change: 7.80, changePercent: 1.95, volume: '16.2M' },
    { rank: 2, name: 'Alibaba', ticker: '9988', price: 88.35, change: 1.65, changePercent: 1.90, volume: '38.7M' },
    { rank: 3, name: 'Meituan', ticker: '3690', price: 156.80, change: 2.40, changePercent: 1.55, volume: '14.2M' },
    { rank: 4, name: 'AIA', ticker: '1299', price: 58.25, change: 0.65, changePercent: 1.13, volume: '10.8M' },
    { rank: 5, name: 'HSBC', ticker: '0005', price: 73.40, change: 0.45, changePercent: 0.62, volume: '18.4M' },
    { rank: 6, name: 'JD.com', ticker: '9618', price: 145.20, change: 2.80, changePercent: 1.97, volume: '7.6M' },
    { rank: 7, name: 'Xiaomi', ticker: '1810', price: 33.85, change: 0.75, changePercent: 2.27, volume: '78.4M' },
    { rank: 8, name: 'BYD', ticker: '1211', price: 312.40, change: 4.20, changePercent: 1.36, volume: '5.8M' },
  ],
};

export const topGainers: Record<MarketRegion, TopMover[]> = {
  us: [
    { name: 'Tesla', ticker: 'TSLA', changePercent: 3.88 },
    { name: 'Palantir', ticker: 'PLTR', changePercent: 2.45 },
    { name: 'Costco', ticker: 'COST', changePercent: 1.82 },
    { name: 'Eli Lilly', ticker: 'LLY', changePercent: 1.54 },
    { name: 'Visa', ticker: 'V', changePercent: 1.21 },
  ],
  kr: [
    { name: 'SK하이닉스', ticker: '000660', changePercent: 3.64 },
    { name: '삼성전자', ticker: '005930', changePercent: 1.71 },
    { name: '기아', ticker: '000270', changePercent: 1.71 },
    { name: '현대차', ticker: '005380', changePercent: 1.69 },
    { name: '카카오', ticker: '035720', changePercent: 1.59 },
  ],
  jp: [
    { name: 'Sony', ticker: '6758', changePercent: 1.84 },
    { name: 'Tokyo Electron', ticker: '8035', changePercent: 1.73 },
    { name: 'SoftBank', ticker: '9984', changePercent: 1.58 },
    { name: 'Mitsubishi UFJ', ticker: '8306', changePercent: 1.54 },
    { name: 'Keyence', ticker: '6861', changePercent: 1.51 },
  ],
  hk: [
    { name: 'Xiaomi', ticker: '1810', changePercent: 2.27 },
    { name: 'JD.com', ticker: '9618', changePercent: 1.97 },
    { name: 'Tencent', ticker: '0700', changePercent: 1.95 },
    { name: 'Alibaba', ticker: '9988', changePercent: 1.90 },
    { name: 'Meituan', ticker: '3690', changePercent: 1.55 },
  ],
};

export const topLosers: Record<MarketRegion, TopMover[]> = {
  us: [
    { name: 'NVIDIA', ticker: 'NVDA', changePercent: -2.87 },
    { name: 'Broadcom', ticker: 'AVGO', changePercent: -2.18 },
    { name: 'AMD', ticker: 'AMD', changePercent: -1.92 },
    { name: 'Intel', ticker: 'INTC', changePercent: -1.56 },
    { name: 'Meta', ticker: 'META', changePercent: -0.86 },
  ],
  kr: [
    { name: 'LG화학', ticker: '051910', changePercent: -0.82 },
    { name: '포스코홀딩스', ticker: '005490', changePercent: -0.65 },
    { name: 'KB금융', ticker: '105560', changePercent: -0.48 },
    { name: '신한지주', ticker: '055550', changePercent: -0.35 },
    { name: '하나금융지주', ticker: '086790', changePercent: -0.28 },
  ],
  jp: [
    { name: 'Daikin', ticker: '6367', changePercent: -0.72 },
    { name: 'Shin-Etsu', ticker: '4063', changePercent: -0.58 },
    { name: 'Recruit', ticker: '6098', changePercent: -0.45 },
    { name: 'KDDI', ticker: '9433', changePercent: -0.38 },
    { name: 'Takeda', ticker: '4502', changePercent: -0.25 },
  ],
  hk: [
    { name: 'Li Auto', ticker: '2015', changePercent: -1.24 },
    { name: 'NetEase', ticker: '9999', changePercent: -0.92 },
    { name: 'Ping An', ticker: '2318', changePercent: -0.68 },
    { name: 'China Mobile', ticker: '0941', changePercent: -0.45 },
    { name: 'CNOOC', ticker: '0883', changePercent: -0.32 },
  ],
};
