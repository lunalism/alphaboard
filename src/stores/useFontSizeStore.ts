import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 폰트 크기 단계 타입
 * xs: 가장 작은 크기
 * sm: 작은 크기
 * md: 기본 크기 (default)
 * lg: 큰 크기
 * xl: 가장 큰 크기
 */
export type FontSizeLevel = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 폰트 크기 Store 상태 인터페이스
 */
interface FontSizeState {
  // 제목 폰트 크기 (기본: md)
  titleSize: FontSizeLevel;
  // 본문 폰트 크기 (기본: md)
  bodySize: FontSizeLevel;
  // 제목 크기 변경 함수
  setTitleSize: (size: FontSizeLevel) => void;
  // 본문 크기 변경 함수
  setBodySize: (size: FontSizeLevel) => void;
  // 전체 초기화 함수
  resetFontSize: () => void;
}

/**
 * 폰트 크기별 픽셀 값 매핑
 *
 * 홈화면 (뉴스 카드):
 *   제목: xs 12px / sm 14px / md 16px / lg 18px / xl 20px
 *   본문: xs 10px / sm 12px / md 14px / lg 16px / xl 18px
 *
 * 기사 상세:
 *   제목: xs 18px / sm 21px / md 24px / lg 28px / xl 32px
 *   본문: xs 13px / sm 15px / md 17px / lg 19px / xl 21px
 */
export const FONT_SIZE_MAP = {
  // 뉴스 카드 제목 크기
  card: {
    title: {
      xs: 'text-xs',      // 12px
      sm: 'text-sm',      // 14px
      md: 'text-base',    // 16px
      lg: 'text-lg',      // 18px
      xl: 'text-xl',      // 20px
    },
    // 뉴스 카드 본문(요약) 크기
    body: {
      xs: 'text-[10px]',  // 10px
      sm: 'text-xs',      // 12px
      md: 'text-sm',      // 14px
      lg: 'text-base',    // 16px
      xl: 'text-lg',      // 18px
    },
  },
  // 기사 상세 페이지
  article: {
    title: {
      xs: 'text-lg',      // 18px
      sm: 'text-xl',      // 21px (약간 차이)
      md: 'text-2xl',     // 24px
      lg: 'text-[28px]',  // 28px
      xl: 'text-[32px]',  // 32px
    },
    body: {
      xs: 'text-[13px]',  // 13px
      sm: 'text-[15px]',  // 15px
      md: 'text-[17px]',  // 17px
      lg: 'text-[19px]',  // 19px
      xl: 'text-[21px]',  // 21px
    },
  },
} as const;

/**
 * 크기 레벨 배열 (UI에서 순회용)
 */
export const FONT_SIZE_LEVELS: FontSizeLevel[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * 크기 레벨별 레이블 (UI 표시용)
 */
export const FONT_SIZE_LABELS: Record<FontSizeLevel, string> = {
  xs: '아주 작게',
  sm: '작게',
  md: '보통',
  lg: '크게',
  xl: '아주 크게',
};

/**
 * 폰트 크기 관리 Zustand Store
 *
 * localStorage에 'tickerbird-font-size' 키로 저장되어
 * 새로고침해도 설정이 유지됩니다.
 *
 * @example
 * const { titleSize, bodySize, setTitleSize, setBodySize } = useFontSizeStore();
 *
 * // 제목 크기 변경
 * setTitleSize('lg');
 *
 * // 본문 크기 변경
 * setBodySize('sm');
 *
 * // 스타일 적용
 * <h2 className={FONT_SIZE_MAP.card.title[titleSize]}>제목</h2>
 * <p className={FONT_SIZE_MAP.card.body[bodySize]}>본문</p>
 */
export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      // 기본값: md (보통)
      titleSize: 'md',
      bodySize: 'md',

      // 제목 크기 설정
      setTitleSize: (size) => set({ titleSize: size }),

      // 본문 크기 설정
      setBodySize: (size) => set({ bodySize: size }),

      // 초기화
      resetFontSize: () => set({ titleSize: 'md', bodySize: 'md' }),
    }),
    {
      name: 'tickerbird-font-size', // localStorage 키
    }
  )
);
