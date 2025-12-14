import { MarketTab, MarketIndex, Stock, TopMover, MarketRegion } from '@/types/market';

export const marketTabs: MarketTab[] = [
  { id: 'us', label: '미국', flag: '🇺🇸' },
  { id: 'kr', label: '한국', flag: '🇰🇷' },
  { id: 'jp', label: '일본', flag: '🇯🇵' },
  { id: 'hk', label: '홍콩', flag: '🇭🇰' },
];

export const marketIndices: Record<MarketRegion, MarketIndex[]> = {
  us: [
    { id: 'spx', name: 'S&P 500', value: 6051.09, change: 23.35, changePercent: 0.39, chartData: [5980, 5995, 6010, 6005, 6020, 6035, 6025, 6040, 6051] },
    { id: 'ndx', name: 'NASDAQ', value: 19926.72, change: 159.05, changePercent: 0.80, chartData: [19650, 19700, 19750, 19720, 19800, 19850, 19880, 19900, 19927] },
    { id: 'dji', name: 'Dow Jones', value: 43828.06, change: -86.06, changePercent: -0.20, chartData: [43950, 43920, 43880, 43900, 43850, 43870, 43840, 43820, 43828] },
    { id: 'rut', name: 'Russell 2000', value: 2346.90, change: 14.23, changePercent: 0.61, chartData: [2320, 2325, 2330, 2335, 2340, 2338, 2342, 2345, 2347] },
  ],
  kr: [
    { id: 'kospi', name: 'KOSPI', value: 2494.46, change: -15.64, changePercent: -0.62, chartData: [2520, 2515, 2510, 2505, 2500, 2498, 2496, 2495, 2494] },
    { id: 'kosdaq', name: 'KOSDAQ', value: 693.50, change: -4.21, changePercent: -0.60, chartData: [702, 700, 698, 697, 696, 695, 694, 694, 694] },
  ],
  jp: [
    { id: 'n225', name: 'Nikkei 225', value: 39470.44, change: 378.70, changePercent: 0.97, chartData: [39000, 39100, 39150, 39200, 39280, 39350, 39400, 39450, 39470] },
    { id: 'topix', name: 'TOPIX', value: 2746.56, change: 26.38, changePercent: 0.97, chartData: [2710, 2715, 2720, 2725, 2730, 2735, 2740, 2745, 2747] },
  ],
  hk: [
    { id: 'hsi', name: 'Hang Seng', value: 20397.05, change: 242.36, changePercent: 1.20, chartData: [20100, 20150, 20180, 20220, 20280, 20320, 20360, 20380, 20397] },
    { id: 'hscei', name: 'HSCEI', value: 7313.48, change: 106.18, changePercent: 1.47, chartData: [7180, 7200, 7220, 7250, 7270, 7290, 7300, 7310, 7313] },
  ],
};

export const popularStocks: Record<MarketRegion, Stock[]> = {
  us: [
    { rank: 1, name: 'Apple', ticker: 'AAPL', price: 248.13, change: 2.54, changePercent: 1.03, volume: '48.2M' },
    { rank: 2, name: 'NVIDIA', ticker: 'NVDA', price: 134.25, change: 3.87, changePercent: 2.97, volume: '312.5M' },
    { rank: 3, name: 'Tesla', ticker: 'TSLA', price: 424.77, change: -8.43, changePercent: -1.95, volume: '89.7M' },
    { rank: 4, name: 'Microsoft', ticker: 'MSFT', price: 448.29, change: 5.12, changePercent: 1.16, volume: '21.3M' },
    { rank: 5, name: 'Alphabet', ticker: 'GOOGL', price: 193.95, change: 2.18, changePercent: 1.14, volume: '25.8M' },
    { rank: 6, name: 'Amazon', ticker: 'AMZN', price: 227.03, change: 3.45, changePercent: 1.54, volume: '42.1M' },
    { rank: 7, name: 'Meta', ticker: 'META', price: 617.12, change: -4.23, changePercent: -0.68, volume: '15.6M' },
    { rank: 8, name: 'Broadcom', ticker: 'AVGO', price: 224.26, change: 8.92, changePercent: 4.14, volume: '28.4M' },
  ],
  kr: [
    { rank: 1, name: '삼성전자', ticker: '005930', price: 53400, change: -600, changePercent: -1.11, volume: '12.8M' },
    { rank: 2, name: 'SK하이닉스', ticker: '000660', price: 173500, change: 2500, changePercent: 1.46, volume: '4.2M' },
    { rank: 3, name: 'LG에너지솔루션', ticker: '373220', price: 371000, change: -5000, changePercent: -1.33, volume: '0.5M' },
    { rank: 4, name: '현대차', ticker: '005380', price: 207500, change: 1500, changePercent: 0.73, volume: '0.8M' },
    { rank: 5, name: '기아', ticker: '000270', price: 94600, change: 800, changePercent: 0.85, volume: '1.2M' },
    { rank: 6, name: '셀트리온', ticker: '068270', price: 185500, change: -2500, changePercent: -1.33, volume: '0.9M' },
    { rank: 7, name: 'NAVER', ticker: '035420', price: 192000, change: 3000, changePercent: 1.59, volume: '0.7M' },
    { rank: 8, name: '카카오', ticker: '035720', price: 41200, change: -350, changePercent: -0.84, volume: '2.1M' },
  ],
  jp: [
    { rank: 1, name: 'Toyota', ticker: '7203', price: 2847, change: 32, changePercent: 1.14, volume: '15.2M' },
    { rank: 2, name: 'Sony', ticker: '6758', price: 3215, change: 45, changePercent: 1.42, volume: '8.7M' },
    { rank: 3, name: 'Keyence', ticker: '6861', price: 65780, change: -420, changePercent: -0.63, volume: '0.4M' },
    { rank: 4, name: 'SoftBank', ticker: '9984', price: 9125, change: 185, changePercent: 2.07, volume: '12.3M' },
    { rank: 5, name: 'Nintendo', ticker: '7974', price: 9012, change: -78, changePercent: -0.86, volume: '3.1M' },
    { rank: 6, name: 'Fast Retailing', ticker: '9983', price: 51240, change: 890, changePercent: 1.77, volume: '0.6M' },
    { rank: 7, name: 'Tokyo Electron', ticker: '8035', price: 24680, change: 520, changePercent: 2.15, volume: '1.8M' },
    { rank: 8, name: 'Mitsubishi UFJ', ticker: '8306', price: 1842, change: 23, changePercent: 1.26, volume: '45.2M' },
  ],
  hk: [
    { rank: 1, name: 'Tencent', ticker: '0700', price: 408.60, change: 8.20, changePercent: 2.05, volume: '18.5M' },
    { rank: 2, name: 'Alibaba', ticker: '9988', price: 88.35, change: 1.85, changePercent: 2.14, volume: '42.3M' },
    { rank: 3, name: 'Meituan', ticker: '3690', price: 156.80, change: -2.30, changePercent: -1.45, volume: '15.7M' },
    { rank: 4, name: 'AIA', ticker: '1299', price: 58.25, change: 0.75, changePercent: 1.30, volume: '12.1M' },
    { rank: 5, name: 'HSBC', ticker: '0005', price: 73.40, change: 0.55, changePercent: 0.75, volume: '21.8M' },
    { rank: 6, name: 'JD.com', ticker: '9618', price: 145.20, change: 3.40, changePercent: 2.40, volume: '8.9M' },
    { rank: 7, name: 'Xiaomi', ticker: '1810', price: 33.85, change: 0.95, changePercent: 2.89, volume: '85.2M' },
    { rank: 8, name: 'BYD', ticker: '1211', price: 312.40, change: -5.60, changePercent: -1.76, volume: '6.4M' },
  ],
};

export const topGainers: Record<MarketRegion, TopMover[]> = {
  us: [
    { name: 'Broadcom', ticker: 'AVGO', changePercent: 4.14 },
    { name: 'NVIDIA', ticker: 'NVDA', changePercent: 2.97 },
    { name: 'AMD', ticker: 'AMD', changePercent: 2.45 },
    { name: 'Amazon', ticker: 'AMZN', changePercent: 1.54 },
    { name: 'Microsoft', ticker: 'MSFT', changePercent: 1.16 },
  ],
  kr: [
    { name: 'NAVER', ticker: '035420', changePercent: 1.59 },
    { name: 'SK하이닉스', ticker: '000660', changePercent: 1.46 },
    { name: '기아', ticker: '000270', changePercent: 0.85 },
    { name: '현대차', ticker: '005380', changePercent: 0.73 },
    { name: 'KB금융', ticker: '105560', changePercent: 0.52 },
  ],
  jp: [
    { name: 'Tokyo Electron', ticker: '8035', changePercent: 2.15 },
    { name: 'SoftBank', ticker: '9984', changePercent: 2.07 },
    { name: 'Fast Retailing', ticker: '9983', changePercent: 1.77 },
    { name: 'Sony', ticker: '6758', changePercent: 1.42 },
    { name: 'Mitsubishi UFJ', ticker: '8306', changePercent: 1.26 },
  ],
  hk: [
    { name: 'Xiaomi', ticker: '1810', changePercent: 2.89 },
    { name: 'JD.com', ticker: '9618', changePercent: 2.40 },
    { name: 'Alibaba', ticker: '9988', changePercent: 2.14 },
    { name: 'Tencent', ticker: '0700', changePercent: 2.05 },
    { name: 'AIA', ticker: '1299', changePercent: 1.30 },
  ],
};

export const topLosers: Record<MarketRegion, TopMover[]> = {
  us: [
    { name: 'Tesla', ticker: 'TSLA', changePercent: -1.95 },
    { name: 'Intel', ticker: 'INTC', changePercent: -1.42 },
    { name: 'Boeing', ticker: 'BA', changePercent: -1.18 },
    { name: 'Meta', ticker: 'META', changePercent: -0.68 },
    { name: 'Dow Jones', ticker: 'DJI', changePercent: -0.20 },
  ],
  kr: [
    { name: 'LG에너지솔루션', ticker: '373220', changePercent: -1.33 },
    { name: '셀트리온', ticker: '068270', changePercent: -1.33 },
    { name: '삼성전자', ticker: '005930', changePercent: -1.11 },
    { name: '카카오', ticker: '035720', changePercent: -0.84 },
    { name: 'LG화학', ticker: '051910', changePercent: -0.78 },
  ],
  jp: [
    { name: 'Nintendo', ticker: '7974', changePercent: -0.86 },
    { name: 'Keyence', ticker: '6861', changePercent: -0.63 },
    { name: 'Daikin', ticker: '6367', changePercent: -0.45 },
    { name: 'Shin-Etsu', ticker: '4063', changePercent: -0.38 },
    { name: 'Recruit', ticker: '6098', changePercent: -0.25 },
  ],
  hk: [
    { name: 'BYD', ticker: '1211', changePercent: -1.76 },
    { name: 'Meituan', ticker: '3690', changePercent: -1.45 },
    { name: 'Li Auto', ticker: '2015', changePercent: -1.12 },
    { name: 'NetEase', ticker: '9999', changePercent: -0.85 },
    { name: 'Ping An', ticker: '2318', changePercent: -0.42 },
  ],
};
