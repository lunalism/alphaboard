/**
 * 가격 알림 관련 타입 정의
 *
 * Supabase price_alerts 테이블과 매핑되는 타입들
 * 사용자가 설정한 목표가 알림 기능에 사용
 */

/**
 * 시장 구분 타입
 * KR: 한국 (KOSPI, KOSDAQ)
 * US: 미국 (NYSE, NASDAQ, AMEX)
 */
export type AlertMarket = 'KR' | 'US';

/**
 * 알림 방향 타입
 * above: 목표가 이상일 때 알림 (상승 알림)
 * below: 목표가 이하일 때 알림 (하락 알림)
 */
export type AlertDirection = 'above' | 'below';

/**
 * 가격 알림 인터페이스
 * price_alerts 테이블의 레코드 구조
 */
export interface PriceAlert {
  // 알림 고유 ID (UUID)
  id: string;
  // 사용자 ID (profiles.id 참조)
  userId: string;
  // 종목 코드 (예: '005930', 'AAPL')
  ticker: string;
  // 시장 구분 (KR/US)
  market: AlertMarket;
  // 종목명 (예: '삼성전자', 'Apple Inc.')
  stockName: string;
  // 목표 가격
  targetPrice: number;
  // 알림 방향 (above/below)
  direction: AlertDirection;
  // 활성화 상태 (true: 활성, false: 비활성)
  isActive: boolean;
  // 트리거 상태 (true: 발생함, false: 미발생)
  isTriggered: boolean;
  // 생성 시간
  createdAt: string;
  // 트리거 시간 (알림 발생 시)
  triggeredAt?: string;
}

/**
 * 알림 생성 요청 타입
 * POST /api/alerts 요청 본문
 */
export interface CreateAlertRequest {
  // 종목 코드
  ticker: string;
  // 시장 구분
  market: AlertMarket;
  // 종목명
  stockName: string;
  // 목표 가격
  targetPrice: number;
  // 알림 방향
  direction: AlertDirection;
}

/**
 * 알림 수정 요청 타입
 * PATCH /api/alerts/[id] 요청 본문
 */
export interface UpdateAlertRequest {
  // 활성화 상태 변경 (선택)
  isActive?: boolean;
  // 목표 가격 변경 (선택)
  targetPrice?: number;
  // 알림 방향 변경 (선택)
  direction?: AlertDirection;
}

/**
 * API 응답 타입
 */
export interface AlertApiResponse<T = PriceAlert> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 알림 목록 API 응답 타입
 */
export interface AlertListResponse {
  success: boolean;
  data?: PriceAlert[];
  error?: string;
}

/**
 * Supabase price_alerts 테이블 Row 타입
 * DB에서 조회한 원본 데이터 형식 (snake_case)
 */
export interface PriceAlertRow {
  id: string;
  user_id: string;
  ticker: string;
  market: string;
  stock_name: string;
  target_price: number;
  direction: string;
  is_active: boolean;
  is_triggered: boolean;
  created_at: string;
  triggered_at: string | null;
}

/**
 * DB Row를 PriceAlert로 변환
 *
 * @param row Supabase에서 조회한 Row
 * @returns PriceAlert 객체
 */
export function rowToPriceAlert(row: PriceAlertRow): PriceAlert {
  return {
    id: row.id,
    userId: row.user_id,
    ticker: row.ticker,
    market: row.market as AlertMarket,
    stockName: row.stock_name,
    targetPrice: row.target_price,
    direction: row.direction as AlertDirection,
    isActive: row.is_active,
    isTriggered: row.is_triggered,
    createdAt: row.created_at,
    triggeredAt: row.triggered_at || undefined,
  };
}
