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
 * - 신규 사용자 감지 및 온보딩 지원
 * - 프로필 업데이트 기능
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
  isNewUser: boolean;  // 신규 사용자 여부 (프로필에 name이 없음)
  // 액션
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;  // 프로필 업데이트 (온보딩용)
  setIsNewUser: (value: boolean) => void;  // 신규 사용자 상태 수동 설정
}

// Context 생성 (기본값 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Supabase User에서 기본 UserProfile 추출
 * (profiles 테이블 조회 전 임시 프로필)
 */
const extractUserProfile = (user: User, profileName?: string | null): UserProfile => ({
  id: user.id,
  email: user.email || '',
  name: profileName ||
        (user.user_metadata?.full_name as string) ||
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);  // 신규 사용자 여부

  // Supabase 클라이언트
  const supabase = createClient();

  /**
   * profiles 테이블에서 사용자 프로필 조회
   * - 프로필이 없거나 name이 없으면 신규 사용자로 판단
   */
  const checkUserProfile = useCallback(async (supabaseUser: User): Promise<boolean> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', supabaseUser.id)
        .single();

      // 프로필이 없거나 name이 없으면 신규 사용자
      if (error || !profile || !profile.name) {
        setIsNewUser(true);
        // 기본 프로필 설정 (Google OAuth 정보 사용)
        setUserProfile(extractUserProfile(supabaseUser));
        return true;
      }

      // 기존 사용자 - profiles 테이블의 name 사용
      setIsNewUser(false);
      setUserProfile({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile.name,
        avatarUrl: profile.avatar_url ||
                   (supabaseUser.user_metadata?.avatar_url as string) ||
                   (supabaseUser.user_metadata?.picture as string),
      });
      return false;
    } catch (err) {
      console.error('[AuthProvider] 프로필 조회 예외:', err);
      // 에러 시에도 기본 프로필 설정
      setUserProfile(extractUserProfile(supabaseUser));
      return false;
    }
  }, [supabase]);

  /**
   * 프로필 업데이트 (온보딩에서 닉네임 저장 시 사용)
   */
  const updateProfile = useCallback(async (name: string) => {
    if (!user) {
      throw new Error('로그인이 필요합니다');
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: name,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    // 상태 업데이트
    setIsNewUser(false);
    setUserProfile(prev => prev ? { ...prev, name } : null);
  }, [user, supabase]);

  /**
   * 프로필 새로고침 (profiles 테이블에서 최신 정보 가져오기)
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await checkUserProfile(user);
  }, [user, checkUserProfile]);

  /**
   * 로그아웃
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange에서 SIGNED_OUT 이벤트로 상태 업데이트됨
  }, [supabase]);

  /**
   * 초기화 및 세션 구독
   */
  useEffect(() => {
    // 초기 세션 확인
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!error && session?.user) {
          setSession(session);
          setUser(session.user);
          // 프로필 조회 (신규/기존 사용자 판별)
          await checkUserProfile(session.user);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // INITIAL_SESSION은 initSession에서 이미 처리함
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // 세션 및 사용자 상태 업데이트
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // 로그인 시 프로필 조회 (신규/기존 사용자 판별)
          await checkUserProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 시 상태 초기화
          setUserProfile(null);
          setIsNewUser(false);
          setIsLoading(false);
        }
      }
    );

    // 클린업
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, checkUserProfile]);

  // 로그인 여부
  const isLoggedIn = !!user;

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isLoading,
    isLoggedIn,
    isNewUser,
    signOut,
    refreshProfile,
    updateProfile,
    setIsNewUser,
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
 * Sidebar, ProfilePage, OnboardingPage 등에서 사용합니다.
 *
 * @example
 * const { userProfile, isLoggedIn, isNewUser, updateProfile, signOut } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
