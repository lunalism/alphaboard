/**
 * 뉴스 데이터 페칭 훅
 *
 * 네이버 금융 뉴스 크롤링 API를 호출하여 뉴스 데이터를 가져옵니다.
 *
 * 지원 카테고리:
 * - headlines: 실시간 속보
 * - market: 시장 뉴스
 * - disclosure: 기업 공시 (대표이사 변경, 최대주주 변경 등)
 * - world: 해외증시
 * - bond: 채권/외환
 *
 * @example
 * ```tsx
 * // 실시간 속보 조회
 * const { news, isLoading, error } = useNews({ category: 'headlines' });
 *
 * // 기업 공시 뉴스 조회
 * const { news } = useNews({ category: 'disclosure' });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  CrawledNewsItem,
  CrawledNewsCategory,
  CrawledNewsResponse,
  CrawledNewsErrorResponse,
} from '@/types/crawled-news';

/**
 * useNews 훅 옵션
 */
interface UseNewsOptions {
  /** 뉴스 카테고리 (headlines, market, disclosure, world, bond) */
  category?: CrawledNewsCategory;
  /** 최대 뉴스 개수 */
  limit?: number;
  /** 자동 페칭 활성화 (기본: true) */
  enabled?: boolean;
  /** 리페치 간격 (ms, 0이면 비활성화) */
  refetchInterval?: number;
}

/**
 * useNews 훅 반환 타입
 */
interface UseNewsResult {
  /** 뉴스 목록 */
  news: CrawledNewsItem[];
  /** 전체 뉴스 개수 */
  totalCount: number;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 상태 */
  error: string | null;
  /** 캐시 적중 여부 */
  isCached: boolean;
  /** 데이터 리페치 함수 */
  refetch: () => Promise<void>;
  /** 조회 시각 */
  timestamp: string | null;
}

/**
 * 뉴스 데이터 페칭 훅
 *
 * @param options - 페칭 옵션
 * @returns 뉴스 데이터 및 상태
 */
export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const {
    category = 'headlines',
    limit = 20,
    enabled = true,
    refetchInterval = 0,
  } = options;

  const [news, setNews] = useState<CrawledNewsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  /**
   * 뉴스 데이터 페칭
   *
   * API 호출 흐름:
   * 1. /api/news?category={category}&limit={limit} 호출
   * 2. 응답 데이터 파싱 및 상태 업데이트
   * 3. 캐시 적중 여부 및 타임스탬프 저장
   */
  const fetchNews = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // URL 파라미터 구성 (category, limit)
      const params = new URLSearchParams({
        category,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/news?${params.toString()}`);
      const data: CrawledNewsResponse | CrawledNewsErrorResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorData = data as CrawledNewsErrorResponse;
        throw new Error(errorData.message || '뉴스를 불러오는데 실패했습니다.');
      }

      const successData = data as CrawledNewsResponse;
      setNews(successData.news);
      setTotalCount(successData.totalCount);
      setIsCached(successData.cache.hit);
      setTimestamp(successData.timestamp);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('[useNews] 뉴스 페칭 에러:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [category, limit, enabled]);

  /**
   * 초기 페칭 및 카테고리 변경 시 리페치
   */
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  /**
   * 자동 리페치 간격 설정
   */
  useEffect(() => {
    if (refetchInterval <= 0 || !enabled) return;

    const intervalId = setInterval(() => {
      fetchNews();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, enabled, fetchNews]);

  return {
    news,
    totalCount,
    isLoading,
    error,
    isCached,
    refetch: fetchNews,
    timestamp,
  };
}

/**
 * 여러 카테고리의 뉴스를 동시에 가져오는 훅
 *
 * @example
 * ```tsx
 * const { newsMap, isLoading } = useMultiCategoryNews(['headlines', 'market', 'world']);
 * ```
 */
interface UseMultiCategoryNewsResult {
  /** 카테고리별 뉴스 맵 */
  newsMap: Record<CrawledNewsCategory, CrawledNewsItem[]>;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 목록 */
  errors: Record<CrawledNewsCategory, string | null>;
  /** 전체 리페치 함수 */
  refetchAll: () => Promise<void>;
}

export function useMultiCategoryNews(
  categories: CrawledNewsCategory[],
  limit: number = 10
): UseMultiCategoryNewsResult {
  // 카테고리별 뉴스 초기 상태
  const [newsMap, setNewsMap] = useState<Record<CrawledNewsCategory, CrawledNewsItem[]>>({
    headlines: [],
    market: [],
    disclosure: [],
    world: [],
    bond: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  // 카테고리별 에러 상태
  const [errors, setErrors] = useState<Record<CrawledNewsCategory, string | null>>({
    headlines: null,
    market: null,
    disclosure: null,
    world: null,
    bond: null,
  });

  const fetchAll = useCallback(async () => {
    setIsLoading(true);

    const results = await Promise.allSettled(
      categories.map(async (category) => {
        const params = new URLSearchParams({ category, limit: limit.toString() });
        const response = await fetch(`/api/news?${params.toString()}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || `${category} 뉴스 로딩 실패`);
        }

        return { category, news: data.news as CrawledNewsItem[] };
      })
    );

    const newNewsMap = { ...newsMap };
    const newErrors = { ...errors };

    results.forEach((result, index) => {
      const category = categories[index];
      if (result.status === 'fulfilled') {
        newNewsMap[category] = result.value.news;
        newErrors[category] = null;
      } else {
        newErrors[category] = result.reason?.message || '로딩 실패';
      }
    });

    setNewsMap(newNewsMap);
    setErrors(newErrors);
    setIsLoading(false);
  }, [categories, limit]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    newsMap,
    isLoading,
    errors,
    refetchAll: fetchAll,
  };
}
