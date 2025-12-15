import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 테마 모드 타입
 * - light: 라이트 모드
 * - dark: 다크 모드
 * - system: 시스템 설정 따라감
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 테마 Store 상태 인터페이스
 */
interface ThemeState {
  // 현재 테마 모드 (기본: system)
  theme: ThemeMode;
  // 테마 변경 함수
  setTheme: (theme: ThemeMode) => void;
  // 테마 토글 함수 (light <-> dark)
  toggleTheme: () => void;
}

/**
 * 테마 레이블 (UI 표시용)
 */
export const THEME_LABELS: Record<ThemeMode, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템',
};

/**
 * 테마 아이콘 (UI 표시용)
 */
export const THEME_ICONS: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
};

/**
 * 테마 관리 Zustand Store
 *
 * localStorage에 'alphaboard-theme' 키로 저장되어
 * 새로고침해도 설정이 유지됩니다.
 *
 * @example
 * const { theme, setTheme, toggleTheme } = useThemeStore();
 *
 * // 테마 변경
 * setTheme('dark');
 *
 * // 토글 (light <-> dark)
 * toggleTheme();
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 기본값: system (시스템 설정 따라감)
      theme: 'system',

      // 테마 설정
      setTheme: (theme) => set({ theme }),

      // 테마 토글 (light <-> dark, system인 경우 dark로)
      toggleTheme: () => {
        const currentTheme = get().theme;
        if (currentTheme === 'light') {
          set({ theme: 'dark' });
        } else {
          set({ theme: 'light' });
        }
      },
    }),
    {
      name: 'alphaboard-theme', // localStorage 키
    }
  )
);

/**
 * 실제 적용할 테마 계산 함수
 * system 모드일 때 시스템 설정을 확인하여 실제 테마 반환
 *
 * @param theme - 저장된 테마 모드
 * @param prefersDark - 시스템이 다크 모드인지 여부
 * @returns 실제 적용할 테마 ('light' | 'dark')
 */
export function getEffectiveTheme(theme: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return theme;
}
