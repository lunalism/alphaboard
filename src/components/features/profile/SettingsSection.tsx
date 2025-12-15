'use client';

import { UserSettings, Language } from '@/types';
import {
  useFontSizeStore,
  useThemeStore,
  FONT_SIZE_LEVELS,
  FONT_SIZE_LABELS,
  FontSizeLevel,
  ThemeMode,
  THEME_LABELS,
} from '@/stores';

interface SettingsSectionProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onLogout: () => void;
}

export function SettingsSection({ settings, onSettingsChange, onLogout }: SettingsSectionProps) {
  // 폰트 크기 store 연결
  const { titleSize, bodySize, setTitleSize, setBodySize, resetFontSize } = useFontSizeStore();
  // 테마 store 연결
  const { theme, setTheme } = useThemeStore();

  const handleNotificationChange = (key: keyof UserSettings['notifications']) => {
    onSettingsChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (language: Language) => {
    onSettingsChange({ ...settings, language });
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          알림 설정
        </h3>
        <div className="space-y-4">
          <ToggleItem
            label="관심종목 알림"
            description="관심종목의 가격 변동 알림"
            checked={settings.notifications.watchlist}
            onChange={() => handleNotificationChange('watchlist')}
          />
          <ToggleItem
            label="커뮤니티 댓글 알림"
            description="내 게시글에 댓글이 달리면 알림"
            checked={settings.notifications.comments}
            onChange={() => handleNotificationChange('comments')}
          />
          <ToggleItem
            label="뉴스 알림"
            description="중요 뉴스 및 속보 알림"
            checked={settings.notifications.news}
            onChange={() => handleNotificationChange('news')}
          />
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          테마 설정
        </h3>
        <div className="flex flex-wrap gap-4">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((themeOption) => (
            <label key={themeOption} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                checked={theme === themeOption}
                onChange={() => handleThemeChange(themeOption)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-gray-700 dark:text-gray-300">{THEME_LABELS[themeOption]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          언어 설정
        </h3>
        <select
          value={settings.language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Font Size Settings - 글씨 크기 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            글씨 크기
          </h3>
          {/* 초기화 버튼 */}
          <button
            onClick={resetFontSize}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            기본값으로 초기화
          </button>
        </div>

        {/* 제목 크기 설정 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">제목 크기</p>
          <FontSizeSelector
            currentSize={titleSize}
            onSizeChange={setTitleSize}
            previewType="title"
          />
        </div>

        {/* 본문 크기 설정 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">본문 크기</p>
          <FontSizeSelector
            currentSize={bodySize}
            onSizeChange={setBodySize}
            previewType="body"
          />
        </div>

        {/* 실시간 미리보기 */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">미리보기</p>
          <FontSizePreview titleSize={titleSize} bodySize={bodySize} />
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          계정
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={onLogout}
            className="text-red-500 dark:text-red-400 font-medium hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            로그아웃
          </button>
          <span className="hidden sm:block text-gray-300 dark:text-gray-600">|</span>
          <button className="text-gray-400 dark:text-gray-500 text-sm hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleItem({ label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * 글씨 크기 선택 컴포넌트
 * 5단계의 크기를 "가" 글자로 표시하여 직관적으로 선택
 */
interface FontSizeSelectorProps {
  currentSize: FontSizeLevel;
  onSizeChange: (size: FontSizeLevel) => void;
  previewType: 'title' | 'body';
}

function FontSizeSelector({ currentSize, onSizeChange, previewType }: FontSizeSelectorProps) {
  // 각 레벨별 미리보기 글자 크기 (px)
  const previewSizes: Record<FontSizeLevel, number> = previewType === 'title'
    ? { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }
    : { xs: 10, sm: 12, md: 14, lg: 16, xl: 18 };

  return (
    <div className="flex items-end gap-2">
      {FONT_SIZE_LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => onSizeChange(level)}
          className={`
            flex flex-col items-center justify-end px-3 py-2 rounded-lg transition-all
            ${currentSize === level
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 dark:ring-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          title={FONT_SIZE_LABELS[level]}
        >
          {/* 크기별 "가" 미리보기 */}
          <span
            className="font-medium leading-none mb-1"
            style={{ fontSize: `${previewSizes[level]}px` }}
          >
            가
          </span>
          {/* 레벨 표시 */}
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">{level}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 실시간 미리보기 컴포넌트
 * 현재 설정된 글씨 크기를 뉴스 카드 형식으로 미리보기
 */
interface FontSizePreviewProps {
  titleSize: FontSizeLevel;
  bodySize: FontSizeLevel;
}

function FontSizePreview({ titleSize, bodySize }: FontSizePreviewProps) {
  // 제목 크기 매핑 (홈화면 기준)
  const titleSizeMap: Record<FontSizeLevel, string> = {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    md: 'text-base',    // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
  };

  // 본문 크기 매핑 (홈화면 기준)
  const bodySizeMap: Record<FontSizeLevel, string> = {
    xs: 'text-[10px]',  // 10px
    sm: 'text-xs',      // 12px
    md: 'text-sm',      // 14px
    lg: 'text-base',    // 16px
    xl: 'text-lg',      // 18px
  };

  return (
    <div className="space-y-2">
      {/* 미리보기 제목 */}
      <h4 className={`${titleSizeMap[titleSize]} font-bold text-gray-900 dark:text-white leading-snug`}>
        연준, 금리 인하 시사하며 시장 반등 기대감 고조
      </h4>
      {/* 미리보기 본문 */}
      <p className={`${bodySizeMap[bodySize]} text-gray-600 dark:text-gray-300 leading-relaxed`}>
        연방준비제도가 인플레이션 둔화 신호에 따라 금리 인하를 검토 중이며, 이에 따라 주요 지수들이 상승세를 보이고 있습니다.
      </p>
    </div>
  );
}
