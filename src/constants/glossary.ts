import { GlossaryTerm, GlossaryCategoryFilter } from '@/types';

/**
 * 용어사전 카테고리 필터 목록
 */
export const glossaryCategoryFilters: GlossaryCategoryFilter[] = [
  { id: 'all', label: '전체', emoji: '📚' },
  { id: 'economic', label: '경제지표', emoji: '📈' },
  { id: 'central-bank', label: '중앙은행', emoji: '🏛️' },
  { id: 'finance', label: '금융', emoji: '💰' },
  { id: 'technical', label: '기술적분석', emoji: '📊' },
  { id: 'crypto', label: '암호화폐', emoji: '🪙' },
];

/**
 * 용어사전 목업 데이터 (35개 이상)
 */
export const glossaryTerms: GlossaryTerm[] = [
  // ==================== 경제지표 (Economic Indicators) ====================
  {
    id: 'cpi',
    abbreviation: 'CPI',
    fullName: 'Consumer Price Index',
    korean: '소비자물가지수',
    category: 'economic',
    description:
      '소비자가 구입하는 상품과 서비스의 가격 변동을 측정하는 지표입니다. 인플레이션의 핵심 지표로, 중앙은행의 통화정책 결정에 큰 영향을 미칩니다. 미국에서는 매월 노동통계국(BLS)에서 발표합니다.',
    relatedTerms: ['pce', 'ppi'],
  },
  {
    id: 'ppi',
    abbreviation: 'PPI',
    fullName: 'Producer Price Index',
    korean: '생산자물가지수',
    category: 'economic',
    description:
      '생산자가 판매하는 상품과 서비스의 가격 변동을 측정합니다. CPI의 선행지표로 활용되며, 기업의 원가 부담을 파악하는 데 유용합니다. 생산 단계별로 원자재, 중간재, 완제품으로 구분됩니다.',
    relatedTerms: ['cpi'],
  },
  {
    id: 'pce',
    abbreviation: 'PCE',
    fullName: 'Personal Consumption Expenditures',
    korean: '개인소비지출',
    category: 'economic',
    description:
      '미국 가계의 소비 지출을 측정하는 지표로, 연준(Fed)이 물가 목표 기준으로 삼는 핵심 지표입니다. Core PCE(근원 PCE)는 변동성이 큰 식품과 에너지를 제외하여 기조적 물가 흐름을 파악합니다.',
    relatedTerms: ['cpi', 'fed'],
  },
  {
    id: 'gdp',
    abbreviation: 'GDP',
    fullName: 'Gross Domestic Product',
    korean: '국내총생산',
    category: 'economic',
    description:
      '일정 기간 동안 한 국가에서 생산된 모든 최종 재화와 서비스의 시장 가치 총합입니다. 경제 성장률의 가장 중요한 지표로, 분기별로 속보치, 잠정치, 확정치 순으로 발표됩니다.',
  },
  {
    id: 'pmi',
    abbreviation: 'PMI',
    fullName: 'Purchasing Managers Index',
    korean: '구매관리자지수',
    category: 'economic',
    description:
      '제조업/서비스업 구매 담당자들의 설문을 바탕으로 경기 상황을 측정합니다. 50을 기준으로 상회하면 경기 확장, 하회하면 경기 수축을 의미합니다. S&P Global과 ISM에서 각각 발표합니다.',
    relatedTerms: ['ism'],
  },
  {
    id: 'ism',
    abbreviation: 'ISM',
    fullName: 'Institute for Supply Management',
    korean: 'ISM 지수',
    category: 'economic',
    description:
      '미국 공급관리협회에서 발표하는 제조업/비제조업 구매관리자지수입니다. 미국 경기의 대표적인 선행지표로, 매월 초에 발표되어 시장에 큰 영향을 미칩니다.',
    relatedTerms: ['pmi'],
  },
  {
    id: 'nfp',
    abbreviation: 'NFP',
    fullName: 'Non-Farm Payrolls',
    korean: '비농업고용',
    category: 'economic',
    description:
      '농업을 제외한 모든 산업의 취업자 수 변화를 측정하는 미국 고용지표입니다. 매월 첫째 주 금요일에 발표되며, 연준의 금리 결정에 핵심적인 역할을 합니다.',
    relatedTerms: ['unemployment-rate'],
  },
  {
    id: 'unemployment-rate',
    abbreviation: 'UR',
    fullName: 'Unemployment Rate',
    korean: '실업률',
    category: 'economic',
    description:
      '경제활동인구 중 실업자가 차지하는 비율입니다. NFP와 함께 발표되며, 노동시장의 건전성을 평가하는 핵심 지표입니다. 연준의 이중책무(물가안정, 완전고용) 중 하나입니다.',
    relatedTerms: ['nfp'],
  },
  {
    id: 'retail-sales',
    abbreviation: 'RS',
    fullName: 'Retail Sales',
    korean: '소매판매',
    category: 'economic',
    description:
      '소매업체의 총 매출액을 측정하여 소비자 지출 동향을 파악합니다. 미국 GDP의 약 70%가 소비로 구성되어 있어, 경기 전망에 중요한 지표입니다.',
  },

  // ==================== 중앙은행 (Central Banks) ====================
  {
    id: 'fomc',
    abbreviation: 'FOMC',
    fullName: 'Federal Open Market Committee',
    korean: '연방공개시장위원회',
    category: 'central-bank',
    description:
      '미국 연준의 통화정책 결정 기구입니다. 연 8회 정기회의를 통해 기준금리(연방기금금리)를 결정합니다. 의장 기자회견과 점도표(Dot Plot) 발표가 시장에 큰 영향을 미칩니다.',
    relatedTerms: ['fed', 'fed-funds-rate'],
  },
  {
    id: 'fed',
    abbreviation: 'Fed',
    fullName: 'Federal Reserve System',
    korean: '연방준비제도',
    category: 'central-bank',
    description:
      '미국의 중앙은행으로, 통화정책 수행, 금융시스템 안정, 결제시스템 운영 등의 역할을 합니다. 물가안정과 완전고용이라는 이중책무(Dual Mandate)를 가지고 있습니다.',
    relatedTerms: ['fomc'],
  },
  {
    id: 'fed-funds-rate',
    abbreviation: 'FFR',
    fullName: 'Federal Funds Rate',
    korean: '연방기금금리',
    category: 'central-bank',
    description:
      '미국 은행들이 지급준비금을 서로 거래할 때 적용하는 초단기 금리입니다. 연준의 통화정책 수단으로, 모든 시장금리의 기준이 됩니다.',
    relatedTerms: ['fomc', 'fed'],
  },
  {
    id: 'bok',
    abbreviation: 'BOK',
    fullName: 'Bank of Korea',
    korean: '한국은행',
    category: 'central-bank',
    description:
      '대한민국의 중앙은행으로, 통화신용정책 수행, 금융안정, 지급결제시스템 운영 등의 역할을 합니다. 금융통화위원회를 통해 기준금리를 결정합니다.',
  },
  {
    id: 'ecb',
    abbreviation: 'ECB',
    fullName: 'European Central Bank',
    korean: '유럽중앙은행',
    category: 'central-bank',
    description:
      '유로존 19개국의 중앙은행으로, 유로화의 통화정책을 담당합니다. 본부는 독일 프랑크푸르트에 위치하며, 물가안정을 최우선 목표로 합니다.',
  },
  {
    id: 'boj',
    abbreviation: 'BOJ',
    fullName: 'Bank of Japan',
    korean: '일본은행',
    category: 'central-bank',
    description:
      '일본의 중앙은행으로, 2013년부터 대규모 양적완화를 시행해왔습니다. 수익률곡선제어(YCC) 정책과 마이너스 금리 정책으로 유명합니다.',
  },
  {
    id: 'qe',
    abbreviation: 'QE',
    fullName: 'Quantitative Easing',
    korean: '양적완화',
    category: 'central-bank',
    description:
      '중앙은행이 국채 등 자산을 매입하여 시중에 유동성을 공급하는 비전통적 통화정책입니다. 제로금리 상황에서 추가적인 경기 부양을 위해 사용됩니다.',
    relatedTerms: ['qt'],
  },
  {
    id: 'qt',
    abbreviation: 'QT',
    fullName: 'Quantitative Tightening',
    korean: '양적긴축',
    category: 'central-bank',
    description:
      '양적완화의 반대 개념으로, 중앙은행이 보유 자산을 매각하거나 만기 도래 시 재투자하지 않아 유동성을 회수하는 정책입니다. 인플레이션 억제 시 사용됩니다.',
    relatedTerms: ['qe'],
  },
  {
    id: 'hawkish',
    abbreviation: 'Hawkish',
    fullName: 'Hawkish',
    korean: '매파적',
    category: 'central-bank',
    description:
      '금리 인상이나 긴축 정책에 우호적인 통화정책 기조를 의미합니다. 물가 안정을 경기 부양보다 우선시하는 성향으로, 인플레이션 우려 시 나타납니다.',
    relatedTerms: ['dovish'],
  },
  {
    id: 'dovish',
    abbreviation: 'Dovish',
    fullName: 'Dovish',
    korean: '비둘기파적',
    category: 'central-bank',
    description:
      '금리 인하나 완화 정책에 우호적인 통화정책 기조입니다. 경기 부양과 고용 증대를 물가 안정보다 우선시하는 성향으로, 경기 침체 우려 시 나타납니다.',
    relatedTerms: ['hawkish'],
  },

  // ==================== 금융 (Finance) ====================
  {
    id: 'eps',
    abbreviation: 'EPS',
    fullName: 'Earnings Per Share',
    korean: '주당순이익',
    category: 'finance',
    description:
      '기업의 당기순이익을 발행주식수로 나눈 값으로, 주식 1주당 벌어들인 이익을 나타냅니다. 기업의 수익성을 평가하는 가장 기본적인 지표입니다.',
    relatedTerms: ['per'],
  },
  {
    id: 'per',
    abbreviation: 'PER',
    fullName: 'Price to Earnings Ratio',
    korean: '주가수익비율',
    category: 'finance',
    description:
      '주가를 주당순이익(EPS)으로 나눈 값으로, 현재 주가가 이익의 몇 배인지를 나타냅니다. PER이 높으면 고평가, 낮으면 저평가로 해석할 수 있으나 업종별 차이가 큽니다.',
    relatedTerms: ['eps', 'pbr'],
  },
  {
    id: 'pbr',
    abbreviation: 'PBR',
    fullName: 'Price to Book Ratio',
    korean: '주가순자산비율',
    category: 'finance',
    description:
      '주가를 주당순자산(BPS)으로 나눈 값입니다. PBR이 1 미만이면 주가가 기업의 청산가치보다 낮다는 의미로, 저평가 지표로 활용됩니다.',
    relatedTerms: ['per'],
  },
  {
    id: 'roe',
    abbreviation: 'ROE',
    fullName: 'Return on Equity',
    korean: '자기자본이익률',
    category: 'finance',
    description:
      '당기순이익을 자기자본으로 나눈 값으로, 주주가 투자한 자본으로 얼마나 이익을 창출했는지를 나타냅니다. 기업의 경영 효율성을 평가하는 핵심 지표입니다.',
    relatedTerms: ['roa'],
  },
  {
    id: 'roa',
    abbreviation: 'ROA',
    fullName: 'Return on Assets',
    korean: '총자산이익률',
    category: 'finance',
    description:
      '당기순이익을 총자산으로 나눈 값으로, 기업이 보유한 총자산을 얼마나 효율적으로 활용하여 이익을 창출했는지를 나타냅니다.',
    relatedTerms: ['roe'],
  },
  {
    id: 'dividend-yield',
    abbreviation: 'DY',
    fullName: 'Dividend Yield',
    korean: '배당수익률',
    category: 'finance',
    description:
      '주당 배당금을 현재 주가로 나눈 값입니다. 투자자가 배당으로 얻는 수익률을 나타내며, 배당 투자 시 중요한 지표입니다.',
  },
  {
    id: 'market-cap',
    abbreviation: 'MCap',
    fullName: 'Market Capitalization',
    korean: '시가총액',
    category: 'finance',
    description:
      '주가에 발행주식수를 곱한 값으로, 시장에서 평가하는 기업의 총 가치입니다. 기업 규모를 비교하는 가장 기본적인 지표입니다.',
  },
  {
    id: 'ev',
    abbreviation: 'EV',
    fullName: 'Enterprise Value',
    korean: '기업가치',
    category: 'finance',
    description:
      '시가총액에 순부채를 더한 값으로, 기업을 인수할 때 실제로 지불해야 하는 금액을 의미합니다. M&A 평가에서 중요한 지표입니다.',
  },

  // ==================== 기술적분석 (Technical Analysis) ====================
  {
    id: 'rsi',
    abbreviation: 'RSI',
    fullName: 'Relative Strength Index',
    korean: '상대강도지수',
    category: 'technical',
    description:
      '주가의 상승/하락 강도를 0~100 사이의 수치로 나타내는 모멘텀 지표입니다. 일반적으로 70 이상이면 과매수, 30 이하면 과매도 구간으로 해석합니다.',
    relatedTerms: ['macd'],
  },
  {
    id: 'macd',
    abbreviation: 'MACD',
    fullName: 'Moving Average Convergence Divergence',
    korean: '이동평균수렴확산',
    category: 'technical',
    description:
      '단기 이동평균과 장기 이동평균의 차이를 이용한 추세 추종 지표입니다. MACD 선과 시그널 선의 교차를 매매 신호로 활용합니다.',
    relatedTerms: ['rsi', 'ma'],
  },
  {
    id: 'ma',
    abbreviation: 'MA',
    fullName: 'Moving Average',
    korean: '이동평균선',
    category: 'technical',
    description:
      '일정 기간 동안의 주가 평균을 연결한 선으로, 추세를 파악하는 가장 기본적인 기술적 지표입니다. 5일, 20일, 60일, 120일, 200일선이 주로 사용됩니다.',
    relatedTerms: ['ema'],
  },
  {
    id: 'ema',
    abbreviation: 'EMA',
    fullName: 'Exponential Moving Average',
    korean: '지수이동평균선',
    category: 'technical',
    description:
      '최근 가격에 더 높은 가중치를 부여하는 이동평균입니다. 단순이동평균(SMA)보다 가격 변화에 더 민감하게 반응합니다.',
    relatedTerms: ['ma'],
  },
  {
    id: 'bollinger-bands',
    abbreviation: 'BB',
    fullName: 'Bollinger Bands',
    korean: '볼린저밴드',
    category: 'technical',
    description:
      '20일 이동평균선을 중심으로 상하 2표준편차 밴드를 그린 지표입니다. 밴드의 폭은 변동성을, 밴드 터치는 과매수/과매도 신호로 해석합니다.',
  },
  {
    id: 'support-resistance',
    abbreviation: 'S/R',
    fullName: 'Support and Resistance',
    korean: '지지선/저항선',
    category: 'technical',
    description:
      '지지선은 주가 하락 시 매수세가 유입되어 더 이상 하락하기 어려운 가격대이고, 저항선은 상승 시 매도세로 인해 상승이 억제되는 가격대입니다.',
  },
  {
    id: 'golden-cross',
    abbreviation: 'GC',
    fullName: 'Golden Cross',
    korean: '골든크로스',
    category: 'technical',
    description:
      '단기 이동평균선이 장기 이동평균선을 아래에서 위로 돌파하는 것을 말합니다. 상승 추세 전환의 신호로 해석되며, 매수 타이밍으로 활용됩니다.',
    relatedTerms: ['death-cross'],
  },
  {
    id: 'death-cross',
    abbreviation: 'DC',
    fullName: 'Death Cross',
    korean: '데드크로스',
    category: 'technical',
    description:
      '단기 이동평균선이 장기 이동평균선을 위에서 아래로 돌파하는 것입니다. 하락 추세 전환의 신호로 해석되며, 매도 타이밍으로 활용됩니다.',
    relatedTerms: ['golden-cross'],
  },

  // ==================== 암호화폐 (Crypto) ====================
  {
    id: 'btc-etf',
    abbreviation: 'BTC ETF',
    fullName: 'Bitcoin Exchange Traded Fund',
    korean: '비트코인 ETF',
    category: 'crypto',
    description:
      '비트코인 가격을 추종하는 상장지수펀드입니다. 2024년 1월 미국 SEC가 현물 ETF를 최초 승인하면서 기관투자자의 비트코인 접근성이 크게 높아졌습니다.',
    relatedTerms: ['btc-halving'],
  },
  {
    id: 'btc-halving',
    abbreviation: 'Halving',
    fullName: 'Bitcoin Halving',
    korean: '비트코인 반감기',
    category: 'crypto',
    description:
      '약 4년(210,000블록)마다 비트코인 채굴 보상이 절반으로 줄어드는 이벤트입니다. 공급 감소로 인해 역사적으로 반감기 이후 가격이 상승하는 패턴을 보여왔습니다.',
    relatedTerms: ['btc-etf'],
  },
  {
    id: 'staking',
    abbreviation: 'Staking',
    fullName: 'Staking',
    korean: '스테이킹',
    category: 'crypto',
    description:
      '암호화폐를 일정 기간 예치하고 네트워크 검증에 참여하여 보상을 받는 것입니다. 지분증명(PoS) 기반 블록체인에서 사용되며, 이더리움 2.0이 대표적입니다.',
    relatedTerms: ['defi'],
  },
  {
    id: 'defi',
    abbreviation: 'DeFi',
    fullName: 'Decentralized Finance',
    korean: '탈중앙화 금융',
    category: 'crypto',
    description:
      '블록체인 기반으로 중개자 없이 운영되는 금융 서비스입니다. 대출, 거래, 예금 등 기존 금융 서비스를 스마트 컨트랙트로 구현합니다.',
    relatedTerms: ['staking'],
  },
  {
    id: 'nft',
    abbreviation: 'NFT',
    fullName: 'Non-Fungible Token',
    korean: '대체불가토큰',
    category: 'crypto',
    description:
      '블록체인에 기록된 고유한 디지털 자산입니다. 디지털 아트, 게임 아이템, 음악 등 다양한 분야에서 소유권과 진위를 증명하는 데 사용됩니다.',
  },
  {
    id: 'altcoin',
    abbreviation: 'Altcoin',
    fullName: 'Alternative Coin',
    korean: '알트코인',
    category: 'crypto',
    description:
      '비트코인을 제외한 모든 암호화폐를 통칭합니다. 이더리움, 솔라나, 리플 등이 대표적이며, 각각 고유한 기술과 목적을 가지고 있습니다.',
  },
  {
    id: 'gas-fee',
    abbreviation: 'Gas',
    fullName: 'Gas Fee',
    korean: '가스비',
    category: 'crypto',
    description:
      '이더리움 네트워크에서 트랜잭션을 실행하거나 스마트 컨트랙트를 실행할 때 지불하는 수수료입니다. 네트워크 혼잡도에 따라 변동됩니다.',
  },
  {
    id: 'layer2',
    abbreviation: 'L2',
    fullName: 'Layer 2',
    korean: '레이어2',
    category: 'crypto',
    description:
      '기존 블록체인(Layer 1) 위에 구축되어 확장성과 속도를 개선하는 기술입니다. Arbitrum, Optimism, Base 등이 이더리움의 대표적인 L2 솔루션입니다.',
  },
];

/**
 * 용어 ID로 용어 검색
 */
export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find((term) => term.id === id);
}

/**
 * 약어로 용어 검색
 */
export function getGlossaryTermByAbbreviation(abbreviation: string): GlossaryTerm | undefined {
  return glossaryTerms.find(
    (term) => term.abbreviation.toLowerCase() === abbreviation.toLowerCase()
  );
}

/**
 * 용어 검색 (약어, 전체명, 한글명에서 검색)
 */
export function searchGlossaryTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(
    (term) =>
      term.abbreviation.toLowerCase().includes(lowerQuery) ||
      term.fullName.toLowerCase().includes(lowerQuery) ||
      term.korean.includes(query)
  );
}
