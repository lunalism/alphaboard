'use client';

/**
 * useAdminBetaWhitelist - 베타 화이트리스트 관리 훅
 *
 * Firestore betaWhitelist 컬렉션을 관리합니다.
 * 문서 ID = 이메일 주소 (O(1) 조회)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { BetaWhitelistEntry } from '@/types/admin';

interface UseAdminBetaWhitelistReturn {
  entries: BetaWhitelistEntry[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredEntries: BetaWhitelistEntry[];
  addEmail: (email: string, note?: string) => Promise<void>;
  addEmails: (emails: string[], note?: string) => Promise<{ added: number; duplicates: number }>;
  removeEmail: (email: string) => Promise<void>;
  refreshList: () => Promise<void>;
}

export function useAdminBetaWhitelist(): UseAdminBetaWhitelistReturn {
  const { userProfile } = useAuth();
  const [entries, setEntries] = useState<BetaWhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 클라이언트 사이드 검색 필터
  const filteredEntries = searchQuery
    ? entries.filter(
        (entry) =>
          entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.note?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  /**
   * 화이트리스트 목록 조회
   */
  const refreshList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const whitelistRef = collection(db, 'betaWhitelist');
      const q = query(whitelistRef, orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(q);

      const fetchedEntries: BetaWhitelistEntry[] = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          email: docSnapshot.id,
          addedAt: data.addedAt,
          addedBy: data.addedBy || '',
          note: data.note || undefined,
        };
      });

      setEntries(fetchedEntries);
    } catch (err) {
      console.error('[useAdminBetaWhitelist] 목록 조회 에러:', err);
      setError('화이트리스트를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마운트 시 조회
  useEffect(() => {
    refreshList();
  }, [refreshList]);

  /**
   * 단건 이메일 추가
   */
  const addEmail = useCallback(
    async (email: string, note?: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
      }

      // 중복 체크
      const existingDoc = await getDoc(doc(db, 'betaWhitelist', normalizedEmail));
      if (existingDoc.exists()) {
        throw new Error('이미 등록된 이메일입니다.');
      }

      try {
        await setDoc(doc(db, 'betaWhitelist', normalizedEmail), {
          email: normalizedEmail,
          addedAt: serverTimestamp(),
          addedBy: userProfile?.email || '',
          note: note || null,
        });

        await refreshList();
      } catch (err) {
        console.error('[useAdminBetaWhitelist] 이메일 추가 에러:', err);
        throw new Error('이메일 추가에 실패했습니다.');
      }
    },
    [userProfile?.email, refreshList]
  );

  /**
   * 일괄 이메일 추가
   */
  const addEmails = useCallback(
    async (emails: string[], note?: string): Promise<{ added: number; duplicates: number }> => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let added = 0;
      let duplicates = 0;

      for (const email of emails) {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !emailRegex.test(normalizedEmail)) continue;

        const existingDoc = await getDoc(doc(db, 'betaWhitelist', normalizedEmail));
        if (existingDoc.exists()) {
          duplicates++;
          continue;
        }

        try {
          await setDoc(doc(db, 'betaWhitelist', normalizedEmail), {
            email: normalizedEmail,
            addedAt: serverTimestamp(),
            addedBy: userProfile?.email || '',
            note: note || null,
          });
          added++;
        } catch (err) {
          console.error('[useAdminBetaWhitelist] 일괄 추가 에러:', normalizedEmail, err);
        }
      }

      await refreshList();
      return { added, duplicates };
    },
    [userProfile?.email, refreshList]
  );

  /**
   * 이메일 삭제
   */
  const removeEmail = useCallback(
    async (email: string) => {
      try {
        await deleteDoc(doc(db, 'betaWhitelist', email));
        await refreshList();
      } catch (err) {
        console.error('[useAdminBetaWhitelist] 이메일 삭제 에러:', err);
        throw new Error('이메일 삭제에 실패했습니다.');
      }
    },
    [refreshList]
  );

  return {
    entries,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filteredEntries,
    addEmail,
    addEmails,
    removeEmail,
    refreshList,
  };
}

export default useAdminBetaWhitelist;
