/**
 * 프로필 관리 훅
 *
 * Supabase profiles 테이블과 연동하여
 * 사용자 프로필 조회/수정 기능 제공
 */

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
}

interface UseProfileReturn {
  // 상태
  isLoading: boolean;
  error: string | null;

  // 함수
  fetchProfile: (userId: string) => Promise<Profile | null>;
  updateProfile: (userId: string, data: UpdateProfileData) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 프로필 조회
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data as Profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필을 불러오는데 실패했습니다';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 프로필 업데이트
   */
  const updateProfile = useCallback(async (
    userId: string,
    data: UpdateProfileData
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필 수정에 실패했습니다';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}
