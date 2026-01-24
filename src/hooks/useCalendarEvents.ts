/**
 * 경제 캘린더 이벤트 조회 훅
 *
 * @description
 * /api/calendar/events API를 호출하여 경제 캘린더 이벤트를 가져옵니다.
 * SWR 패턴으로 캐싱 및 재검증을 지원합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용법 (전체 이벤트 조회)
 * const { events, isLoading, error } = useCalendarEvents();
 *
 * // 날짜 범위 필터
 * const { events } = useCalendarEvents({
 *   from: '2025-01-01',
 *   to: '2025-01-31'
 * });
 *
 * // 카테고리 필터
 * const { events } = useCalendarEvents({
 *   category: 'institution'
 * });
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarEvent, EventCategory } from '@/types';

// ==================== 타입 정의 ====================

/**
 * 훅 옵션
 */
interface UseCalendarEventsOptions {
  /** 시작 날짜 (YYYY-MM-DD) */
  from?: string;
  /** 종료 날짜 (YYYY-MM-DD) */
  to?: string;
  /** 카테고리 필터 */
  category?: EventCategory | 'all';
  /** 자동 갱신 활성화 여부 (기본: true) */
  autoRefresh?: boolean;
  /** 자동 갱신 간격 (밀리초, 기본: 5분) */
  refreshInterval?: number;
}

/**
 * 훅 반환 타입
 */
interface UseCalendarEventsResult {
  /** 이벤트 목록 */
  events: CalendarEvent[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 데이터 소스 (static, finnhub 등) */
  source: string;
  /** 수동 새로고침 */
  refetch: () => Promise<void>;
}

/**
 * API 응답 타입
 */
interface CalendarEventsAPIResponse {
  success: boolean;
  events?: CalendarEvent[];
  totalCount?: number;
  source?: string;
  error?: string;
  message?: string;
}

// ==================== 훅 구현 ====================

/**
 * 경제 캘린더 이벤트 조회 훅
 *
 * @param options 조회 옵션 (날짜 범위, 카테고리 등)
 * @returns 이벤트 목록, 로딩 상태, 에러 정보
 */
export function useCalendarEvents(
  options: UseCalendarEventsOptions = {}
): UseCalendarEventsResult {
  const {
    from,
    to,
    category = 'all',
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5분
  } = options;

  // 상태 관리
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('static');

  // 타이머 참조 (클린업용)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * API 호출 함수
   */
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (category && category !== 'all') params.append('category', category);

      // API 호출
      const url = `/api/calendar/events${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      const data: CalendarEventsAPIResponse = await response.json();

      if (data.success && data.events) {
        setEvents(data.events);
        setSource(data.source || 'static');
      } else {
        setError(data.message || '이벤트를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('[useCalendarEvents] 에러:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [from, to, category]);

  // 초기 로드 및 옵션 변경 시 재조회
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 자동 갱신 설정
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(fetchEvents, refreshInterval);
    }

    // 클린업
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchEvents]);

  return {
    events,
    isLoading,
    error,
    source,
    refetch: fetchEvents,
  };
}

// hooks/index.ts에 export 추가 필요
export default useCalendarEvents;
