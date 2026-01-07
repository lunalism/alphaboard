/**
 * 가격 알림 커스텀 훅
 *
 * 가격 알림 CRUD 기능을 제공하는 React 훅
 * API 호출 및 상태 관리를 캡슐화
 *
 * 주요 기능:
 * - 알림 목록 조회
 * - 새 알림 추가
 * - 알림 수정 (활성화/비활성화)
 * - 알림 삭제
 *
 * 사용 예:
 * ```tsx
 * const { alerts, isLoading, addAlert, toggleAlert, deleteAlert } = useAlerts();
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores';
import {
  PriceAlert,
  CreateAlertRequest,
  AlertListResponse,
  AlertApiResponse,
} from '@/types/priceAlert';

/**
 * useAlerts 훅 반환 타입
 */
interface UseAlertsReturn {
  // 알림 목록
  alerts: PriceAlert[];
  // 로딩 상태
  isLoading: boolean;
  // 에러 메시지
  error: string | null;
  // 알림 목록 새로고침
  refetch: () => Promise<void>;
  // 새 알림 추가
  addAlert: (request: CreateAlertRequest) => Promise<{ success: boolean; error?: string }>;
  // 알림 활성화/비활성화 토글
  toggleAlert: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  // 알림 삭제
  deleteAlert: (id: string) => Promise<{ success: boolean; error?: string }>;
  // 특정 종목에 대한 알림 존재 여부 확인
  hasAlertForTicker: (ticker: string) => boolean;
  // 특정 종목의 알림 목록
  getAlertsForTicker: (ticker: string) => PriceAlert[];
}

/**
 * 가격 알림 관리 커스텀 훅
 *
 * @returns 알림 데이터 및 CRUD 함수
 */
export function useAlerts(): UseAlertsReturn {
  // 알림 목록 상태
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 인증 상태 확인
  const { isLoggedIn } = useAuthStore();

  /**
   * 알림 목록 조회
   *
   * API를 호출하여 현재 사용자의 알림 목록을 가져옴
   */
  const fetchAlerts = useCallback(async () => {
    // 비로그인 상태에서는 조회하지 않음
    if (!isLoggedIn) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/alerts');
      const result: AlertListResponse = await response.json();

      if (result.success && result.data) {
        setAlerts(result.data);
      } else {
        setError(result.error || '알림 목록을 불러오는데 실패했습니다');
        setAlerts([]);
      }
    } catch (err) {
      console.error('알림 조회 에러:', err);
      setError('네트워크 에러가 발생했습니다');
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // 컴포넌트 마운트 및 로그인 상태 변경 시 알림 조회
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /**
   * 새 알림 추가
   *
   * @param request 알림 생성 요청 데이터
   * @returns 성공 여부
   */
  const addAlert = useCallback(
    async (request: CreateAlertRequest): Promise<{ success: boolean; error?: string }> => {
      if (!isLoggedIn) {
        return { success: false, error: '로그인이 필요합니다' };
      }

      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        const result: AlertApiResponse = await response.json();

        if (result.success && result.data) {
          // 새 알림을 목록 맨 앞에 추가
          setAlerts((prev) => [result.data!, ...prev]);
          return { success: true };
        }

        return { success: false, error: result.error || '알림 추가에 실패했습니다' };
      } catch (err) {
        console.error('알림 추가 에러:', err);
        return { success: false, error: '네트워크 에러가 발생했습니다' };
      }
    },
    [isLoggedIn]
  );

  /**
   * 알림 활성화/비활성화 토글
   *
   * @param id 알림 ID
   * @param isActive 새 활성화 상태
   * @returns 성공 여부
   */
  const toggleAlert = useCallback(
    async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
      if (!isLoggedIn) {
        return { success: false, error: '로그인이 필요합니다' };
      }

      try {
        const response = await fetch(`/api/alerts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        });

        const result: AlertApiResponse = await response.json();

        if (result.success && result.data) {
          // 목록에서 해당 알림 업데이트
          setAlerts((prev) =>
            prev.map((alert) => (alert.id === id ? result.data! : alert))
          );
          return { success: true };
        }

        return { success: false, error: result.error || '알림 수정에 실패했습니다' };
      } catch (err) {
        console.error('알림 토글 에러:', err);
        return { success: false, error: '네트워크 에러가 발생했습니다' };
      }
    },
    [isLoggedIn]
  );

  /**
   * 알림 삭제
   *
   * @param id 알림 ID
   * @returns 성공 여부
   */
  const deleteAlert = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!isLoggedIn) {
        return { success: false, error: '로그인이 필요합니다' };
      }

      try {
        const response = await fetch(`/api/alerts/${id}`, {
          method: 'DELETE',
        });

        const result: AlertApiResponse<null> = await response.json();

        if (result.success) {
          // 목록에서 해당 알림 제거
          setAlerts((prev) => prev.filter((alert) => alert.id !== id));
          return { success: true };
        }

        return { success: false, error: result.error || '알림 삭제에 실패했습니다' };
      } catch (err) {
        console.error('알림 삭제 에러:', err);
        return { success: false, error: '네트워크 에러가 발생했습니다' };
      }
    },
    [isLoggedIn]
  );

  /**
   * 특정 종목에 대한 알림 존재 여부 확인
   *
   * @param ticker 종목 코드
   * @returns 알림 존재 여부
   */
  const hasAlertForTicker = useCallback(
    (ticker: string): boolean => {
      return alerts.some((alert) => alert.ticker === ticker);
    },
    [alerts]
  );

  /**
   * 특정 종목의 알림 목록
   *
   * @param ticker 종목 코드
   * @returns 해당 종목의 알림 목록
   */
  const getAlertsForTicker = useCallback(
    (ticker: string): PriceAlert[] => {
      return alerts.filter((alert) => alert.ticker === ticker);
    },
    [alerts]
  );

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts,
    addAlert,
    toggleAlert,
    deleteAlert,
    hasAlertForTicker,
    getAlertsForTicker,
  };
}
