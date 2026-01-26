/**
 * FAQ 관리 훅
 *
 * Firestore faq 컬렉션에 대한 CRUD 작업을 제공합니다.
 * 관리자 페이지와 사용자 페이지 모두에서 사용 가능합니다.
 *
 * 기능:
 * - FAQ 목록 조회 (발행된 것만 또는 전체)
 * - FAQ 생성/수정/삭제
 * - 카테고리 필터링
 * - 순서 변경
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  faqCollection,
  faqDoc,
  queryCollection,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
} from '@/lib/firestore';
import type {
  FAQ,
  CreateFAQDTO,
  UpdateFAQDTO,
  FAQCategory,
} from '@/types/admin';

// ==================== 타입 정의 ====================

interface UseFAQOptions {
  /** 발행된 FAQ만 조회할지 여부 (기본: false = 전체 조회) */
  publishedOnly?: boolean;
  /** 카테고리 필터 (선택) */
  category?: FAQCategory;
}

interface UseFAQReturn {
  /** FAQ 목록 */
  faqs: FAQ[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** FAQ 목록 새로고침 */
  refresh: () => Promise<void>;
  /** FAQ 생성 */
  createFAQ: (data: CreateFAQDTO) => Promise<string>;
  /** FAQ 수정 */
  updateFAQ: (id: string, data: UpdateFAQDTO) => Promise<void>;
  /** FAQ 삭제 */
  deleteFAQ: (id: string) => Promise<void>;
  /** 단일 FAQ 조회 */
  getFAQ: (id: string) => Promise<FAQ | null>;
  /** FAQ 순서 변경 */
  reorderFAQ: (id: string, newOrder: number) => Promise<void>;
}

// ==================== 훅 구현 ====================

/**
 * FAQ 관리 훅
 *
 * @param options - 조회 옵션
 * @returns FAQ 목록 및 CRUD 함수
 *
 * @example
 * // 관리자 페이지 (전체 조회)
 * const { faqs, createFAQ, reorderFAQ } = useFAQ();
 *
 * // 사용자 페이지 (발행된 것만)
 * const { faqs } = useFAQ({ publishedOnly: true });
 *
 * // 카테고리 필터
 * const { faqs } = useFAQ({ publishedOnly: true, category: 'account' });
 */
export function useFAQ(options: UseFAQOptions = {}): UseFAQReturn {
  const { publishedOnly = false, category } = options;

  // ==================== 상태 ====================
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== FAQ 목록 조회 ====================
  const fetchFAQs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 쿼리 조건 구성
      const constraints = [];

      // 발행된 것만 조회
      if (publishedOnly) {
        constraints.push(where('isPublished', '==', true));
      }

      // 카테고리 필터
      if (category) {
        constraints.push(where('category', '==', category));
      }

      // 정렬: order 순서
      constraints.push(orderBy('order', 'asc'));

      const data = await queryCollection<Omit<FAQ, 'id'>>(
        faqCollection(),
        constraints
      );

      setFaqs(data as FAQ[]);
    } catch (err) {
      console.error('[useFAQ] 조회 실패:', err);
      setError('FAQ를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [publishedOnly, category]);

  // ==================== 초기 로딩 ====================
  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // ==================== FAQ 생성 ====================
  const createFAQ = useCallback(
    async (data: CreateFAQDTO): Promise<string> => {
      try {
        // 새 FAQ의 order 값 계산 (마지막 순서 + 1)
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) : 0;

        const newFAQ = {
          question: data.question,
          answer: data.answer,
          category: data.category,
          order: data.order ?? maxOrder + 1,
          isPublished: data.isPublished ?? false,
        };

        const id = await createDocument(faqCollection(), newFAQ);

        // 목록 새로고침
        await fetchFAQs();

        return id;
      } catch (err) {
        console.error('[useFAQ] 생성 실패:', err);
        throw new Error('FAQ 생성에 실패했습니다.');
      }
    },
    [faqs, fetchFAQs]
  );

  // ==================== FAQ 수정 ====================
  const updateFAQ = useCallback(
    async (id: string, data: UpdateFAQDTO): Promise<void> => {
      try {
        await updateDocument(faqDoc(id), data);

        // 목록 새로고침
        await fetchFAQs();
      } catch (err) {
        console.error('[useFAQ] 수정 실패:', err);
        throw new Error('FAQ 수정에 실패했습니다.');
      }
    },
    [fetchFAQs]
  );

  // ==================== FAQ 삭제 ====================
  const deleteFAQ = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteDocument(faqDoc(id));

        // 목록 새로고침
        await fetchFAQs();
      } catch (err) {
        console.error('[useFAQ] 삭제 실패:', err);
        throw new Error('FAQ 삭제에 실패했습니다.');
      }
    },
    [fetchFAQs]
  );

  // ==================== 단일 FAQ 조회 ====================
  const getFAQ = useCallback(async (id: string): Promise<FAQ | null> => {
    try {
      const data = await getDocument<Omit<FAQ, 'id'>>(faqDoc(id));
      return data as FAQ | null;
    } catch (err) {
      console.error('[useFAQ] 단일 조회 실패:', err);
      return null;
    }
  }, []);

  // ==================== FAQ 순서 변경 ====================
  const reorderFAQ = useCallback(
    async (id: string, newOrder: number): Promise<void> => {
      try {
        await updateDocument(faqDoc(id), { order: newOrder });

        // 목록 새로고침
        await fetchFAQs();
      } catch (err) {
        console.error('[useFAQ] 순서 변경 실패:', err);
        throw new Error('FAQ 순서 변경에 실패했습니다.');
      }
    },
    [fetchFAQs]
  );

  return {
    faqs,
    isLoading,
    error,
    refresh: fetchFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    getFAQ,
    reorderFAQ,
  };
}
