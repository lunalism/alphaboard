/**
 * ETF 구성종목 조회 훅
 *
 * Firestore에서 ETF 구성종목 데이터를 조회하는 커스텀 훅
 *
 * 사용 예시:
 * const { holdings, isLoading, error } = useETFHoldings('QQQ');
 */

import { useState, useEffect, useCallback } from 'react';

// ==================== 타입 정의 ====================

/**
 * ETF 구성종목 개별 아이템
 */
export interface ETFHolding {
  /** 종목 심볼 */
  symbol: string;
  /** 종목명 */
  name: string;
  /** 비중 (%) */
  weight: number;
}

/**
 * ETF 구성종목 전체 데이터
 */
export interface ETFHoldingsData {
  /** ETF 심볼 */
  symbol: string;
  /** ETF 이름 */
  name: string;
  /** 한글 설명 */
  description: string;
  /** 구성종목 배열 (비중 순) */
  holdings: ETFHolding[];
  /** 전체 구성종목 수 */
  totalHoldings: number;
  /** 마지막 업데이트 날짜 */
  updatedAt: string;
}

// ==================== ETF 목록 (구성종목 조회 대상) ====================

/**
 * 구성종목 조회가 가능한 ETF 심볼 목록
 * 이 목록에 포함된 ETF만 구성종목 섹션이 표시됨
 */
export const ETF_WITH_HOLDINGS = ['QQQ', 'SPY', 'VOO', 'ARKK', 'DIA'];

/**
 * 심볼이 ETF인지 확인 (구성종목 조회 가능 여부)
 *
 * @param symbol - 종목 심볼
 * @returns ETF 여부
 */
export function isETFWithHoldings(symbol: string): boolean {
  return ETF_WITH_HOLDINGS.includes(symbol.toUpperCase());
}

// ==================== 커스텀 훅 ====================

/**
 * ETF 구성종목 조회 훅
 *
 * @param symbol - ETF 심볼 (예: 'QQQ', 'SPY')
 * @returns 구성종목 데이터, 로딩 상태, 에러, 재조회 함수
 *
 * @example
 * const { holdings, isLoading, error, refetch } = useETFHoldings('QQQ');
 */
export function useETFHoldings(symbol: string | null) {
  // 상태 관리
  const [data, setData] = useState<ETFHoldingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 호출 함수
  const fetchHoldings = useCallback(async () => {
    // symbol이 없거나 ETF 목록에 없으면 스킵
    if (!symbol || !isETFWithHoldings(symbol)) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/etf/holdings?symbol=${symbol.toUpperCase()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ETF 구성종목 조회 실패');
      }

      setData(result.data);
    } catch (err) {
      console.error('[useETFHoldings] 조회 실패:', err);
      setError(err instanceof Error ? err.message : 'ETF 구성종목 조회 중 오류가 발생했습니다.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // 컴포넌트 마운트 및 symbol 변경 시 데이터 조회
  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  return {
    /** ETF 구성종목 전체 데이터 */
    data,
    /** 구성종목 배열 (편의용) */
    holdings: data?.holdings ?? [],
    /** 로딩 상태 */
    isLoading,
    /** 에러 메시지 */
    error,
    /** 재조회 함수 */
    refetch: fetchHoldings,
  };
}
