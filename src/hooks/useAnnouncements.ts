/**
 * 공지사항 관리 훅
 *
 * Firestore announcements 컬렉션에 대한 CRUD 작업을 제공합니다.
 * 관리자 페이지와 사용자 페이지 모두에서 사용 가능합니다.
 *
 * 기능:
 * - 공지사항 목록 조회 (발행된 것만 또는 전체)
 * - 공지사항 생성/수정/삭제
 * - 카테고리 필터링
 * - 상단 고정 공지 우선 정렬
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  announcementsCollection,
  announcementDoc,
  queryCollection,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  where,
  orderBy,
  serverTimestamp,
} from '@/lib/firestore';
import type {
  Announcement,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementCategory,
} from '@/types/admin';

// ==================== 타입 정의 ====================

interface UseAnnouncementsOptions {
  /** 발행된 공지만 조회할지 여부 (기본: false = 전체 조회) */
  publishedOnly?: boolean;
  /** 카테고리 필터 (선택) */
  category?: AnnouncementCategory;
}

interface UseAnnouncementsReturn {
  /** 공지사항 목록 */
  announcements: Announcement[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 공지사항 목록 새로고침 */
  refresh: () => Promise<void>;
  /** 공지사항 생성 */
  createAnnouncement: (
    data: CreateAnnouncementDTO,
    authorId: string,
    authorName: string
  ) => Promise<string>;
  /** 공지사항 수정 */
  updateAnnouncement: (id: string, data: UpdateAnnouncementDTO) => Promise<void>;
  /** 공지사항 삭제 */
  deleteAnnouncement: (id: string) => Promise<void>;
  /** 단일 공지사항 조회 */
  getAnnouncement: (id: string) => Promise<Announcement | null>;
}

// ==================== 훅 구현 ====================

/**
 * 공지사항 관리 훅
 *
 * @param options - 조회 옵션
 * @returns 공지사항 목록 및 CRUD 함수
 *
 * @example
 * // 관리자 페이지 (전체 조회)
 * const { announcements, createAnnouncement } = useAnnouncements();
 *
 * // 사용자 페이지 (발행된 것만)
 * const { announcements } = useAnnouncements({ publishedOnly: true });
 *
 * // 카테고리 필터
 * const { announcements } = useAnnouncements({ publishedOnly: true, category: 'notice' });
 */
export function useAnnouncements(options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn {
  const { publishedOnly = false, category } = options;

  // ==================== 상태 ====================
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== 공지사항 목록 조회 ====================
  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 쿼리 조건 구성
      // NOTE: Firestore 복합 인덱스 없이 동작하도록 단순 쿼리 사용
      // 필터링과 정렬은 클라이언트에서 수행
      const constraints = [];

      // 발행된 것만 조회 시 where 조건만 사용 (orderBy 제외)
      if (publishedOnly) {
        constraints.push(where('isPublished', '==', true));
      }

      // 카테고리 필터
      if (category) {
        constraints.push(where('category', '==', category));
      }

      // orderBy는 제외하고 클라이언트에서 정렬
      // (복합 인덱스 에러 방지)

      const data = await queryCollection<Omit<Announcement, 'id'>>(
        announcementsCollection(),
        constraints
      );

      // 클라이언트 정렬: 상단 고정 우선 → 최신순
      const sorted = [...data].sort((a, b) => {
        // 1. 상단 고정된 것 우선
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 2. 최신순 정렬 (createdAt 내림차순)
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });

      setAnnouncements(sorted as Announcement[]);
    } catch (err) {
      console.error('[useAnnouncements] 조회 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [publishedOnly, category]);

  // ==================== 초기 로딩 ====================
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ==================== 공지사항 생성 ====================
  const createAnnouncement = useCallback(
    async (
      data: CreateAnnouncementDTO,
      authorId: string,
      authorName: string
    ): Promise<string> => {
      try {
        const newAnnouncement = {
          title: data.title,
          content: data.content,
          category: data.category,
          isPinned: data.isPinned ?? false,
          isPublished: data.isPublished ?? false,
          authorId,
          authorName,
        };

        const id = await createDocument(announcementsCollection(), newAnnouncement);

        // 목록 새로고침
        await fetchAnnouncements();

        return id;
      } catch (err) {
        console.error('[useAnnouncements] 생성 실패:', err);
        throw new Error('공지사항 생성에 실패했습니다.');
      }
    },
    [fetchAnnouncements]
  );

  // ==================== 공지사항 수정 ====================
  const updateAnnouncement = useCallback(
    async (id: string, data: UpdateAnnouncementDTO): Promise<void> => {
      try {
        await updateDocument(announcementDoc(id), data);

        // 목록 새로고침
        await fetchAnnouncements();
      } catch (err) {
        console.error('[useAnnouncements] 수정 실패:', err);
        throw new Error('공지사항 수정에 실패했습니다.');
      }
    },
    [fetchAnnouncements]
  );

  // ==================== 공지사항 삭제 ====================
  const deleteAnnouncement = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteDocument(announcementDoc(id));

        // 목록 새로고침
        await fetchAnnouncements();
      } catch (err) {
        console.error('[useAnnouncements] 삭제 실패:', err);
        throw new Error('공지사항 삭제에 실패했습니다.');
      }
    },
    [fetchAnnouncements]
  );

  // ==================== 단일 공지사항 조회 ====================
  const getAnnouncement = useCallback(async (id: string): Promise<Announcement | null> => {
    try {
      const data = await getDocument<Omit<Announcement, 'id'>>(announcementDoc(id));
      return data as Announcement | null;
    } catch (err) {
      console.error('[useAnnouncements] 단일 조회 실패:', err);
      return null;
    }
  }, []);

  return {
    announcements,
    isLoading,
    error,
    refresh: fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
  };
}
