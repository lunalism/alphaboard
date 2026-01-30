/**
 * 새 공지사항 확인 훅
 *
 * 사용자가 읽지 않은 공지사항이 있는지 체크합니다.
 * localStorage에 읽은 공지 ID 목록을 저장하여 페이지 새로고침 후에도 유지됩니다.
 *
 * ============================================================
 * 사용 방법:
 * ============================================================
 * const { hasNewAnnouncement, markAsRead, unreadCount } = useNewAnnouncement();
 *
 * // 배지 표시
 * {hasNewAnnouncement && <span className="badge">N</span>}
 *
 * // 공지사항 펼쳐 읽을 때 호출
 * markAsRead(announcementId);
 *
 * ============================================================
 * 동작 방식:
 * ============================================================
 * 1. Firestore에서 발행된 모든 공지사항 ID 조회
 * 2. localStorage의 'readAnnouncementIds' 배열과 비교
 * 3. 읽지 않은 공지가 있으면 hasNewAnnouncement = true
 * 4. markAsRead(id) 호출 시 해당 ID를 localStorage 배열에 추가
 * 5. 모든 공지를 읽어야 배지가 사라짐
 *
 * ============================================================
 * 변경 이력:
 * ============================================================
 * - 기존: 페이지 방문 시 lastAnnouncementCheck 시간 저장
 * - 변경: 개별 공지 클릭(펼침) 시에만 읽음 처리
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  announcementsCollection,
  queryCollection,
  where,
} from '@/lib/firestore';
import type { Announcement } from '@/types/admin';

// ==================== 상수 ====================

/** localStorage 키 - 읽은 공지 ID 목록 저장 */
const STORAGE_KEY = 'readAnnouncementIds';

/** 오래된 읽음 데이터 정리 기준 (30일) */
const CLEANUP_DAYS = 30;

// ==================== 타입 ====================

interface UseNewAnnouncementReturn {
  /** 읽지 않은 공지사항 존재 여부 */
  hasNewAnnouncement: boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 특정 공지사항을 읽음 처리 (공지 클릭/펼침 시 호출) */
  markAsRead: (announcementId: string) => void;
  /** 읽지 않은 공지 개수 */
  unreadCount: number;
  /** 읽지 않은 공지 ID 목록 */
  unreadIds: string[];
  /** 특정 공지가 읽음 상태인지 확인 */
  isRead: (announcementId: string) => boolean;
}

// ==================== 유틸 함수 ====================

/**
 * localStorage에서 읽은 공지 ID 목록 가져오기
 *
 * @returns 읽은 공지 ID 배열 (저장된 시간 정보 포함)
 */
function getReadIds(): { id: string; readAt: number }[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // 배열 형식 확인
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

/**
 * 읽은 공지 ID 목록을 localStorage에 저장
 *
 * @param readIds - 저장할 읽은 공지 ID 배열
 */
function saveReadIds(readIds: { id: string; readAt: number }[]): void {
  if (typeof window === 'undefined') return;

  try {
    // 30일 이상 지난 데이터 정리 (메모리 관리)
    const cutoffTime = Date.now() - CLEANUP_DAYS * 24 * 60 * 60 * 1000;
    const filtered = readIds.filter((item) => item.readAt > cutoffTime);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[useNewAnnouncement] localStorage 저장 실패:', err);
  }
}

// ==================== 훅 구현 ====================

/**
 * 새 공지사항 확인 훅
 *
 * 개별 공지사항의 읽음 상태를 추적하여
 * 읽지 않은 공지가 있을 때만 배지를 표시합니다.
 *
 * @returns hasNewAnnouncement, markAsRead, unreadCount 등
 */
export function useNewAnnouncement(): UseNewAnnouncementReturn {
  // ==================== 상태 ====================

  /** 읽지 않은 공지 존재 여부 */
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  /** 로딩 상태 */
  const [isLoading, setIsLoading] = useState(true);

  /** 읽지 않은 공지 ID 목록 */
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  /** 읽은 공지 ID 목록 (localStorage에서 로드) */
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // ==================== 읽음 상태 확인 ====================

  /**
   * 특정 공지가 읽음 상태인지 확인
   *
   * @param announcementId - 확인할 공지 ID
   * @returns 읽음 여부
   */
  const isRead = useCallback(
    (announcementId: string): boolean => {
      return readIds.has(announcementId);
    },
    [readIds]
  );

  // ==================== 읽음 처리 ====================

  /**
   * 공지사항 읽음 처리
   *
   * 공지를 클릭해서 펼쳤을 때 호출합니다.
   * localStorage에 해당 공지 ID를 저장하고 상태를 업데이트합니다.
   *
   * @param announcementId - 읽은 공지 ID
   */
  const markAsRead = useCallback((announcementId: string) => {
    if (typeof window === 'undefined') return;

    try {
      // 현재 저장된 읽은 ID 목록 가져오기
      const currentReadIds = getReadIds();

      // 이미 읽은 공지인지 확인
      const alreadyRead = currentReadIds.some((item) => item.id === announcementId);
      if (alreadyRead) {
        console.log('[useNewAnnouncement] 이미 읽은 공지:', announcementId);
        return;
      }

      // 새로 읽은 공지 추가
      const newReadIds = [
        ...currentReadIds,
        { id: announcementId, readAt: Date.now() },
      ];

      // localStorage에 저장
      saveReadIds(newReadIds);

      // 상태 업데이트
      setReadIds((prev) => new Set([...prev, announcementId]));

      // 읽지 않은 목록에서 제거
      setUnreadIds((prev) => {
        const newUnread = prev.filter((id) => id !== announcementId);
        setHasNewAnnouncement(newUnread.length > 0);
        return newUnread;
      });

      console.log('[useNewAnnouncement] 공지 읽음 처리:', announcementId);
    } catch (err) {
      console.error('[useNewAnnouncement] 읽음 처리 실패:', err);
    }
  }, []);

  // ==================== 초기 로딩 ====================

  /**
   * 컴포넌트 마운트 시 공지사항 목록 조회 및 읽음 상태 확인
   */
  useEffect(() => {
    const checkUnreadAnnouncements = async () => {
      try {
        setIsLoading(true);

        // 1. localStorage에서 읽은 공지 ID 목록 로드
        const storedReadIds = getReadIds();
        const readIdSet = new Set(storedReadIds.map((item) => item.id));
        setReadIds(readIdSet);

        // 2. Firestore에서 발행된 공지사항 조회
        const constraints = [where('isPublished', '==', true)];

        const announcements = await queryCollection<Omit<Announcement, 'id'>>(
          announcementsCollection(),
          constraints
        );

        // 3. 읽지 않은 공지 찾기
        // announcements 배열의 각 항목은 { id, ...data } 형태
        const allIds = announcements.map((a) => (a as Announcement).id);
        const unread = allIds.filter((id) => !readIdSet.has(id));

        setUnreadIds(unread);
        setHasNewAnnouncement(unread.length > 0);

        console.log('[useNewAnnouncement] 체크 결과:', {
          totalAnnouncements: allIds.length,
          readCount: readIdSet.size,
          unreadCount: unread.length,
          unreadIds: unread,
        });
      } catch (err) {
        console.error('[useNewAnnouncement] 확인 실패:', err);
        setHasNewAnnouncement(false);
        setUnreadIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkUnreadAnnouncements();
  }, []);

  // ==================== 반환 ====================

  return {
    hasNewAnnouncement,
    isLoading,
    markAsRead,
    unreadCount: unreadIds.length,
    unreadIds,
    isRead,
  };
}
