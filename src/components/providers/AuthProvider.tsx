'use client';

/**
 * AuthProvider - 전역 인증 상태 관리
 *
 * React Context를 사용하여 전역에서 인증 상태를 관리합니다.
 * Sidebar, ProfilePage 등 모든 컴포넌트에서 useAuth() 훅으로 접근 가능합니다.
 *
 * 주요 기능:
 * - 앱 시작 시 Supabase 세션 확인 (한 번만)
 * - 세션 변경 실시간 감지
 * - 페이지 이동해도 상태 유지
 * - 로그아웃 기능 제공
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// 사용자 프로필 타입 (앱 내부용)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// Context 타입
interface AuthContextType {
  // Supabase 원본 데이터
  user: User | null;
  session: Session | null;
  // 앱 내부용 프로필
  userProfile: UserProfile | null;
  // 상태
  isLoading: boolean;
  isLoggedIn: boolean;
  // 액션
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Context 생성 (기본값 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase User에서 UserProfile 추출
const extractUserProfile = (user: User): UserProfile => ({
  id: user.id,
  email: user.email || '',
  name: (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split('@')[0] ||
        '사용자',
  avatarUrl: (user.user_metadata?.avatar_url as string) ||
             (user.user_metadata?.picture as string),
});

/**
 * AuthProvider 컴포넌트
 *
 * 앱의 최상위에서 한 번만 렌더링되며, 전역 인증 상태를 관리합니다.
 * 페이지 이동해도 언마운트되지 않으므로 상태가 유지됩니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // 상태
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase 클라이언트 (컴포넌트 수준에서 생성)
  const supabase = createClient();

  // 프로필 새로고침 (profiles 테이블에서 최신 정보 가져오기)
  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        // user_metadata를 업데이트하지 않고, 별도로 관리할 수도 있음
        // 여기서는 간단히 로그만 출력
        console.log('[AuthProvider] 프로필 새로고침:', profile);
      }
    } catch (err) {
      console.error('[AuthProvider] 프로필 새로고침 에러:', err);
    }
  }, [user, supabase]);

  // 로그아웃
  const signOut = useCallback(async () => {
    console.log('[AuthProvider] 로그아웃 시작');
    await supabase.auth.signOut();
    // onAuthStateChange에서 SIGNED_OUT 이벤트로 상태 업데이트됨
  }, [supabase]);

  // 초기화 및 세션 구독
  useEffect(() => {
    console.log('[AuthProvider] 초기화 시작');

    // 초기 세션 확인
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthProvider] 세션 조회 에러:', error.message);
        } else {
          console.log('[AuthProvider] 초기 세션:', session?.user?.email || '없음');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('[AuthProvider] 초기화 예외:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AuthProvider] Auth 변경:', event, newSession?.user?.email);

        // INITIAL_SESSION은 initSession에서 이미 처리함
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // 세션 및 사용자 상태 업데이트
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // 로그아웃 시 로딩 상태 해제
        if (event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    );

    // 클린업
    return () => {
      console.log('[AuthProvider] 구독 해제');
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Context 값 계산
  const userProfile = user ? extractUserProfile(user) : null;
  const isLoggedIn = !!user;

  // 디버깅 로그
  console.log('[AuthProvider] 상태:', { isLoading, isLoggedIn, email: userProfile?.email });

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isLoading,
    isLoggedIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth 훅
 *
 * AuthProvider 내부에서 인증 상태에 접근하기 위한 훅입니다.
 * Sidebar, ProfilePage 등에서 사용합니다.
 *
 * @example
 * const { userProfile, isLoggedIn, signOut } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
