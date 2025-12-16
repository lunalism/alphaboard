/**
 * 종목 상세 페이지용 목업 데이터
 * 주식, ETF, 암호화폐, 원자재, 환율 등 다양한 자산 유형 지원
 */

import { AssetDetail, ChartDataPoint, ChartPeriod, RelatedNews } from '@/types/market';

/**
 * 차트 데이터 생성 헬퍼 함수
 * 기준 가격에서 랜덤하게 변동하는 데이터 생성
 */
function generateChartData(
  basePrice: number,
  days: number,
  volatility: number = 0.02
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice * (1 - volatility * days * 0.1);
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 랜덤 변동
    const change = (Math.random() - 0.45) * volatility * price;
    price = Math.max(price + change, basePrice * 0.5);

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    });
  }

  // 마지막 가격을 기준 가격으로 조정
  if (data.length > 0) {
    data[data.length - 1].price = basePrice;
  }

  return data;
}

/**
 * 기간별 차트 데이터 생성
 */
function generateAllPeriodChartData(basePrice: number): Record<ChartPeriod, ChartDataPoint[]> {
  return {
    '1D': generateChartData(basePrice, 1, 0.01),
    '1W': generateChartData(basePrice, 7, 0.015),
    '1M': generateChartData(basePrice, 30, 0.02),
    '3M': generateChartData(basePrice, 90, 0.03),
    '1Y': generateChartData(basePrice, 365, 0.05),
    'ALL': generateChartData(basePrice, 730, 0.08),
  };
}

// ==================== 종목 상세 데이터 ====================
export const assetDetails: Record<string, AssetDetail> = {
  // ==================== 미국 주식 ====================
  'AAPL': {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'stock',
    market: 'us',
    domain: 'apple.com',
    price: 248.13,
    change: -1.22,
    changePercent: -0.49,
    currency: 'USD',
    open: 249.50,
    high: 250.80,
    low: 247.20,
    close: 248.13,
    high52w: 260.10,
    low52w: 164.08,
    volume: '45.2M',
    marketCap: '$3.85T',
    per: 32.5,
    pbr: 48.2,
    eps: 7.64,
    dividendYield: '0.44%',
    chartData: generateAllPeriodChartData(248.13),
  },
  'NVDA': {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    assetType: 'stock',
    market: 'us',
    domain: 'nvidia.com',
    price: 134.25,
    change: -3.96,
    changePercent: -2.87,
    currency: 'USD',
    open: 138.50,
    high: 139.20,
    low: 133.10,
    close: 134.25,
    high52w: 152.89,
    low52w: 47.32,
    volume: '326.8M',
    marketCap: '$3.31T',
    per: 65.2,
    pbr: 52.8,
    eps: 2.06,
    dividendYield: '0.03%',
    chartData: generateAllPeriodChartData(134.25),
  },
  'TSLA': {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    assetType: 'stock',
    market: 'us',
    domain: 'tesla.com',
    price: 424.77,
    change: 15.87,
    changePercent: 3.88,
    currency: 'USD',
    open: 410.00,
    high: 428.50,
    low: 408.20,
    close: 424.77,
    high52w: 488.54,
    low52w: 138.80,
    volume: '112.4M',
    marketCap: '$1.36T',
    per: 112.5,
    pbr: 18.9,
    eps: 3.78,
    chartData: generateAllPeriodChartData(424.77),
  },
  'MSFT': {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    assetType: 'stock',
    market: 'us',
    domain: 'microsoft.com',
    price: 448.29,
    change: -2.88,
    changePercent: -0.64,
    currency: 'USD',
    open: 451.00,
    high: 453.20,
    low: 446.50,
    close: 448.29,
    high52w: 468.35,
    low52w: 362.90,
    volume: '18.7M',
    marketCap: '$3.33T',
    per: 36.8,
    pbr: 12.5,
    eps: 12.18,
    dividendYield: '0.72%',
    chartData: generateAllPeriodChartData(448.29),
  },

  // ==================== 한국 주식 ====================
  '005930': {
    ticker: '005930',
    name: '삼성전자',
    assetType: 'stock',
    market: 'kr',
    domain: 'samsung.com',
    price: 53600,
    change: 900,
    changePercent: 1.71,
    currency: 'KRW',
    open: 52800,
    high: 54000,
    low: 52600,
    close: 53600,
    high52w: 88800,
    low52w: 49900,
    volume: '15.2M',
    marketCap: '₩320조',
    per: 12.8,
    pbr: 1.1,
    eps: 4187,
    dividendYield: '2.61%',
    chartData: generateAllPeriodChartData(53600),
  },
  '000660': {
    ticker: '000660',
    name: 'SK하이닉스',
    assetType: 'stock',
    market: 'kr',
    domain: 'skhynix.com',
    price: 171000,
    change: 6000,
    changePercent: 3.64,
    currency: 'KRW',
    open: 166000,
    high: 172500,
    low: 165500,
    close: 171000,
    high52w: 238500,
    low52w: 110200,
    volume: '2.6M',
    marketCap: '₩124조',
    per: 8.5,
    pbr: 1.8,
    eps: 20118,
    dividendYield: '0.88%',
    chartData: generateAllPeriodChartData(171000),
  },

  // ==================== 미국 ETF ====================
  'SPY': {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    assetType: 'etf',
    market: 'us',
    price: 605.42,
    change: 2.34,
    changePercent: 0.39,
    currency: 'USD',
    open: 603.50,
    high: 607.20,
    low: 602.80,
    close: 605.42,
    high52w: 612.50,
    low52w: 450.20,
    volume: '52.8M',
    aum: '$562B',
    expenseRatio: '0.09%',
    chartData: generateAllPeriodChartData(605.42),
  },
  'QQQ': {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    assetType: 'etf',
    market: 'us',
    price: 527.89,
    change: -1.56,
    changePercent: -0.29,
    currency: 'USD',
    open: 529.00,
    high: 532.50,
    low: 526.20,
    close: 527.89,
    high52w: 542.80,
    low52w: 380.50,
    volume: '38.4M',
    aum: '$312B',
    expenseRatio: '0.20%',
    chartData: generateAllPeriodChartData(527.89),
  },

  // ==================== 한국 ETF ====================
  '069500': {
    ticker: '069500',
    name: 'KODEX 200',
    assetType: 'etf',
    market: 'kr',
    price: 35420,
    change: 380,
    changePercent: 1.08,
    currency: 'KRW',
    open: 35100,
    high: 35550,
    low: 35050,
    close: 35420,
    high52w: 43250,
    low52w: 32150,
    volume: '8.5M',
    aum: '₩8.2조',
    expenseRatio: '0.05%',
    chartData: generateAllPeriodChartData(35420),
  },

  // ==================== 암호화폐 ====================
  'BTC': {
    ticker: 'BTC',
    name: 'Bitcoin',
    assetType: 'crypto',
    market: 'us',
    price: 104832.45,
    change: 2341.56,
    changePercent: 2.28,
    currency: 'USD',
    open: 102500,
    high: 105500,
    low: 101800,
    close: 104832.45,
    high52w: 108500,
    low52w: 38500,
    volume: '48.2B',
    marketCap: '$2.07T',
    volume24h: '$48.2B',
    circulatingSupply: '19.8M BTC',
    chartData: generateAllPeriodChartData(104832.45),
  },
  'ETH': {
    ticker: 'ETH',
    name: 'Ethereum',
    assetType: 'crypto',
    market: 'us',
    price: 3912.78,
    change: 89.34,
    changePercent: 2.34,
    currency: 'USD',
    open: 3820,
    high: 3950,
    low: 3780,
    close: 3912.78,
    high52w: 4100,
    low52w: 1520,
    volume: '18.4B',
    marketCap: '$470B',
    volume24h: '$18.4B',
    circulatingSupply: '120.2M ETH',
    chartData: generateAllPeriodChartData(3912.78),
  },

  // ==================== 원자재 ====================
  'GOLD': {
    ticker: 'GOLD',
    name: 'Gold',
    assetType: 'commodity',
    market: 'us',
    price: 2716.45,
    change: 12.34,
    changePercent: 0.46,
    currency: 'USD',
    open: 2705.00,
    high: 2725.50,
    low: 2698.00,
    close: 2716.45,
    high52w: 2790.00,
    low52w: 1984.50,
    volume: '185K',
    unit: '/oz',
    chartData: generateAllPeriodChartData(2716.45),
  },
  'OIL': {
    ticker: 'OIL',
    name: 'Crude Oil (WTI)',
    assetType: 'commodity',
    market: 'us',
    price: 70.12,
    change: -1.23,
    changePercent: -1.72,
    currency: 'USD',
    open: 71.50,
    high: 72.00,
    low: 69.80,
    close: 70.12,
    high52w: 95.00,
    low52w: 63.50,
    volume: '425K',
    unit: '/bbl',
    chartData: generateAllPeriodChartData(70.12),
  },

  // ==================== 환율 ====================
  'USDKRW': {
    ticker: 'USDKRW',
    name: '달러/원',
    assetType: 'forex',
    market: 'us',
    price: 1434.50,
    change: 3.20,
    changePercent: 0.22,
    currency: 'KRW',
    open: 1431.00,
    high: 1437.50,
    low: 1429.00,
    close: 1434.50,
    high52w: 1450.00,
    low52w: 1280.00,
    volume: '12.5B',
    chartData: generateAllPeriodChartData(1434.50),
  },
};

// ==================== 관련 뉴스 데이터 ====================
export const relatedNewsData: Record<string, RelatedNews[]> = {
  'AAPL': [
    { id: 'n1', title: 'Apple, 새로운 AI 기능 탑재한 iOS 19 발표 예정', source: 'Bloomberg', date: '2시간 전' },
    { id: 'n2', title: 'iPhone 17 Pro, 혁신적인 카메라 시스템 적용', source: 'Reuters', date: '5시간 전' },
    { id: 'n3', title: 'Apple Vision Pro 2세대 개발 착수', source: 'CNBC', date: '1일 전' },
    { id: 'n4', title: '워런 버핏, Apple 지분 추가 매수', source: 'WSJ', date: '2일 전' },
  ],
  'NVDA': [
    { id: 'n1', title: 'NVIDIA, 차세대 AI 칩 Blackwell Ultra 공개', source: 'TechCrunch', date: '3시간 전' },
    { id: 'n2', title: 'AI 반도체 수요 급증으로 NVIDIA 실적 전망 상향', source: 'Bloomberg', date: '8시간 전' },
    { id: 'n3', title: 'NVIDIA, 자율주행 파트너십 확대', source: 'Reuters', date: '1일 전' },
  ],
  'TSLA': [
    { id: 'n1', title: 'Tesla, 완전자율주행 FSD v13 출시 임박', source: 'Electrek', date: '1시간 전' },
    { id: 'n2', title: '테슬라 사이버트럭, 유럽 시장 진출 확정', source: 'Reuters', date: '4시간 전' },
    { id: 'n3', title: 'Tesla 로보택시, 2025년 상반기 서비스 시작', source: 'CNBC', date: '12시간 전' },
  ],
  '005930': [
    { id: 'n1', title: '삼성전자, HBM4 개발 가속화...내년 양산 목표', source: '한국경제', date: '2시간 전' },
    { id: 'n2', title: '삼성, 파운드리 2나노 공정 수율 개선 성과', source: '매일경제', date: '6시간 전' },
    { id: 'n3', title: '갤럭시 S25 시리즈, 역대급 AI 기능 탑재', source: 'ZDNet Korea', date: '1일 전' },
    { id: 'n4', title: '삼성전자, 미국 텍사스 파운드리 투자 확대', source: '연합뉴스', date: '2일 전' },
  ],
  'BTC': [
    { id: 'n1', title: '비트코인, 10만 달러 돌파 후 안정세', source: 'CoinDesk', date: '30분 전' },
    { id: 'n2', title: '기관투자자 비트코인 ETF 순매수 지속', source: 'Bloomberg', date: '2시간 전' },
    { id: 'n3', title: '비트코인 반감기 효과로 상승 모멘텀 지속 전망', source: 'CoinTelegraph', date: '5시간 전' },
  ],
  'GOLD': [
    { id: 'n1', title: '금값, 지정학적 리스크로 사상 최고치 근접', source: 'Reuters', date: '1시간 전' },
    { id: 'n2', title: '중앙은행 금 매입 지속...안전자산 수요 증가', source: 'Bloomberg', date: '4시간 전' },
    { id: 'n3', title: '달러 약세에 금값 상승 탄력', source: 'CNBC', date: '8시간 전' },
  ],
};

/**
 * 티커로 종목 상세 정보 조회
 * 없는 경우 기본 데이터 반환
 */
export function getAssetDetail(ticker: string): AssetDetail | null {
  // 대소문자 구분 없이 검색
  const upperTicker = ticker.toUpperCase();
  return assetDetails[upperTicker] || assetDetails[ticker] || null;
}

/**
 * 티커로 관련 뉴스 조회
 */
export function getRelatedNews(ticker: string): RelatedNews[] {
  const upperTicker = ticker.toUpperCase();
  return relatedNewsData[upperTicker] || relatedNewsData[ticker] || [
    { id: 'default1', title: '시장 동향 및 전망 분석', source: '증권사 리포트', date: '오늘' },
    { id: 'default2', title: '글로벌 경제 지표 발표 일정', source: 'Bloomberg', date: '1일 전' },
    { id: 'default3', title: '투자자 주목할 주요 이벤트', source: 'Reuters', date: '2일 전' },
  ];
}
