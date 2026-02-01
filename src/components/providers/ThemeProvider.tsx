'use client';

import { useEffect, useState, useLayoutEffect } from 'react';
import { useThemeStore, getEffectiveTheme, ThemeMode } from '@/stores';

/**
 * 테마 프로바이더 컴포넌트
 *
 * html 태그에 dark 클래스를 적용/제거하여 테마를 관리합니다.
 * - 시스템 설정 변경 감지 (prefers-color-scheme)
 * - localStorage에서 저장된 테마 불러오기
 * - SSR 깜빡임 방지
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Zustand 스토어에서 테마 가져오기
  const theme = useThemeStore((state) => state.theme);

  // 시스템 다크 모드 설정 상태
  const [prefersDark, setPrefersDark] = useState(false);

  // 마운트 여부 (SSR 깜빡임 방지용)
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 후 시스템 설정 확인
  useEffect(() => {
    setMounted(true);

    // 시스템 다크 모드 설정 확인
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    // 시스템 설정 변경 감지
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 테마 적용 함수
  const applyTheme = (themeMode: ThemeMode, systemPrefersDark: boolean) => {
    const effectiveTheme = getEffectiveTheme(themeMode, systemPrefersDark);
    const root = document.documentElement;

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // 초기 로드 시 localStorage에서 테마 직접 읽어서 적용 (깜빡임 방지)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('tickerbird-theme');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedTheme = parsed.state?.theme as ThemeMode;
        if (storedTheme) {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          applyTheme(storedTheme, systemPrefersDark);
        }
      }
    } catch (e) {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  // 테마 변경 시 적용
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme, prefersDark);
  }, [theme, prefersDark, mounted]);

  // SSR에서는 기본 렌더링, 클라이언트에서 테마 적용
  return <>{children}</>;
}
