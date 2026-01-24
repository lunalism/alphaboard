/**
 * 경제 캘린더 이벤트 API
 *
 * @route GET /api/calendar/events
 * @query from - 시작 날짜 (YYYY-MM-DD, 선택)
 * @query to - 종료 날짜 (YYYY-MM-DD, 선택)
 * @query category - 카테고리 필터 (institution, earnings, corporate, crypto, 선택)
 *
 * @description
 * 경제 캘린더 이벤트 데이터를 반환합니다.
 * 현재는 정적 데이터(constants/calendar.ts)를 사용하며,
 * 추후 Finnhub 등 실제 API로 쉽게 교체할 수 있도록 구조화되어 있습니다.
 *
 * 데이터 소스 전환 시:
 * 1. fetchEventsFromAPI() 함수만 수정하면 됨
 * 2. 응답 포맷은 CalendarEvent 타입 유지
 * 3. 캐싱 로직 추가 권장 (Firestore 또는 Redis)
 *
 * @example
 * // 전체 이벤트 조회
 * GET /api/calendar/events
 *
 * // 날짜 범위 필터
 * GET /api/calendar/events?from=2025-01-01&to=2025-01-31
 *
 * // 카테고리 필터
 * GET /api/calendar/events?category=institution
 *
 * // 복합 필터
 * GET /api/calendar/events?from=2025-01-01&to=2025-03-31&category=earnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { calendarEvents as staticEvents } from '@/constants/calendar';
import { CalendarEvent, EventCategory } from '@/types';

// ==================== 타입 정의 ====================

/**
 * API 성공 응답 타입
 */
interface CalendarEventsResponse {
  success: true;
  events: CalendarEvent[];
  totalCount: number;
  filters: {
    from: string | null;
    to: string | null;
    category: EventCategory | 'all';
  };
  /**
   * 데이터 소스 정보
   * - 'static': constants/calendar.ts 정적 데이터
   * - 'finnhub': Finnhub API (추후 연동)
   * - 'eodhd': EODHD API (추후 연동)
   */
  source: 'static' | 'finnhub' | 'eodhd';
  timestamp: string;
}

/**
 * API 에러 응답 타입
 */
interface CalendarEventsErrorResponse {
  success: false;
  error: string;
  message: string;
}

// ==================== 유틸리티 함수 ====================

/**
 * 날짜 유효성 검사
 *
 * @param dateStr YYYY-MM-DD 형식 문자열
 * @returns 유효한 날짜이면 true
 */
function isValidDate(dateStr: string): boolean {
  // YYYY-MM-DD 형식 체크
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * 카테고리 유효성 검사
 *
 * @param category 카테고리 문자열
 * @returns 유효한 카테고리이면 true
 */
function isValidCategory(category: string): category is EventCategory {
  const validCategories: EventCategory[] = ['institution', 'earnings', 'corporate', 'crypto'];
  return validCategories.includes(category as EventCategory);
}

// ==================== 데이터 조회 함수 ====================

/**
 * 이벤트 데이터 조회
 *
 * @description
 * 현재는 정적 데이터를 반환합니다.
 * 추후 실제 API 연동 시 이 함수만 수정하면 됩니다.
 *
 * @example
 * // Finnhub API 연동 시 (예시)
 * async function fetchEventsFromAPI(): Promise<CalendarEvent[]> {
 *   const response = await fetch(
 *     `https://finnhub.io/api/v1/calendar/economic?token=${FINNHUB_API_KEY}`
 *   );
 *   const data = await response.json();
 *   return transformFinnhubData(data.economicCalendar);
 * }
 */
async function fetchEventsFromAPI(): Promise<CalendarEvent[]> {
  // TODO: 실제 API 연동 시 이 부분을 수정하세요
  // 현재는 정적 데이터 반환
  return staticEvents;
}

// ==================== API 핸들러 ====================

/**
 * GET /api/calendar/events
 *
 * 경제 캘린더 이벤트를 조회합니다.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CalendarEventsResponse | CalendarEventsErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;

  // 쿼리 파라미터 파싱
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const categoryParam = searchParams.get('category');

  // 날짜 유효성 검사
  if (fromParam && !isValidDate(fromParam)) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_DATE',
        message: 'from 파라미터가 유효한 날짜 형식(YYYY-MM-DD)이 아닙니다.',
      },
      { status: 400 }
    );
  }

  if (toParam && !isValidDate(toParam)) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_DATE',
        message: 'to 파라미터가 유효한 날짜 형식(YYYY-MM-DD)이 아닙니다.',
      },
      { status: 400 }
    );
  }

  // 카테고리 유효성 검사
  if (categoryParam && categoryParam !== 'all' && !isValidCategory(categoryParam)) {
    return NextResponse.json(
      {
        success: false,
        error: 'INVALID_CATEGORY',
        message: `유효하지 않은 카테고리입니다. 가능한 값: institution, earnings, corporate, crypto`,
      },
      { status: 400 }
    );
  }

  try {
    // 이벤트 데이터 조회
    let events = await fetchEventsFromAPI();

    // 날짜 범위 필터링
    if (fromParam) {
      events = events.filter((event) => event.date >= fromParam);
    }
    if (toParam) {
      events = events.filter((event) => event.date <= toParam);
    }

    // 카테고리 필터링
    if (categoryParam && categoryParam !== 'all') {
      events = events.filter((event) => event.category === categoryParam);
    }

    // 날짜순 정렬 (오름차순)
    events.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      events,
      totalCount: events.length,
      filters: {
        from: fromParam,
        to: toParam,
        category: (categoryParam as EventCategory) || 'all',
      },
      source: 'static', // 현재 정적 데이터 사용 중
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Calendar API] 에러:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'FETCH_ERROR',
        message: '이벤트 데이터를 가져오는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
