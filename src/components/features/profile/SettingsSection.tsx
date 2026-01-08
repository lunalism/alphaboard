'use client';

import { useState } from 'react';
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
  onDeleteAccount?: () => void;
}

export function SettingsSection({ settings, onSettingsChange, onDeleteAccount }: SettingsSectionProps) {
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

      {/* Danger Zone - 위험 영역 (아코디언) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
        {/* 아코디언 헤더 */}
        <button
          onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-red-600 dark:text-red-400">위험 영역</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">계정 삭제 및 되돌릴 수 없는 작업</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isDangerZoneOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 아코디언 내용 */}
        {isDangerZoneOpen && (
          <div className="px-6 pb-6 border-t border-red-100 dark:border-red-900/30">
            <div className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                회원탈퇴
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">정말 탈퇴하시겠습니까?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              회원탈퇴 시 작성하신 게시글, 댓글, 관심종목 등 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteAccount?.();
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
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
