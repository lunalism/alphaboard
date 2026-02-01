'use client';

/**
 * 환영 팝업 관리 페이지
 *
 * 클로즈베타 환영 팝업의 내용을 관리합니다.
 * - 팝업 활성화/비활성화
 * - 제목, 부제목, 설명 수정
 * - 이미지 업로드
 * - 주의사항 관리
 * - 버튼 텍스트 수정
 * - 실시간 미리보기
 *
 * Firestore 경로: settings/welcomePopup
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/uploadImage';
import { toast } from 'sonner';

// ============================================
// 타입 정의
// ============================================

/** 환영 팝업 설정 타입 */
interface WelcomePopupSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string | null;
  notices: string[];
  buttonText: string;
}

/** 기본 설정 값 */
const DEFAULT_SETTINGS: WelcomePopupSettings = {
  enabled: true,
  title: '환영합니다! 🎉',
  subtitle: 'Tickerbird 클로즈베타',
  description: '글로벌 투자 정보 플랫폼 Tickerbird의 클로즈베타에 참여해주셔서 감사합니다!',
  imageUrl: null,
  notices: [
    '서비스가 불안정할 수 있습니다',
    '데이터가 초기화될 수 있습니다',
    '버그 발견 시 커뮤니티에 제보해주세요',
    '여러분의 피드백이 큰 도움이 됩니다!',
  ],
  buttonText: '시작하기 🚀',
};

// ============================================
// 메인 컴포넌트
// ============================================

export default function PopupSettingsPage() {
  // 설정 상태
  const [settings, setSettings] = useState<WelcomePopupSettings>(DEFAULT_SETTINGS);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);
  // 이미지 업로드 중 상태
  const [isUploading, setIsUploading] = useState(false);
  // 새 주의사항 입력값
  const [newNotice, setNewNotice] = useState('');

  // ========================================
  // Firestore에서 설정 로드
  // ========================================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'welcomePopup');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSettings(docSnap.data() as WelcomePopupSettings);
        } else {
          // 문서가 없으면 기본값으로 생성
          await setDoc(docRef, {
            ...DEFAULT_SETTINGS,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('[PopupSettings] 설정 로드 실패:', error);
        toast.error('설정을 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ========================================
  // 설정 저장
  // ========================================
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'welcomePopup');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('설정이 저장되었습니다');
    } catch (error) {
      console.error('[PopupSettings] 저장 실패:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // ========================================
  // 이미지 업로드
  // ========================================
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadImage(file, 'general');
      if (result.success) {
        setSettings(prev => ({ ...prev, imageUrl: result.url }));
        toast.success('이미지가 업로드되었습니다');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('[PopupSettings] 이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      e.target.value = '';
    }
  }, []);

  // ========================================
  // 이미지 삭제
  // ========================================
  const handleRemoveImage = useCallback(() => {
    setSettings(prev => ({ ...prev, imageUrl: null }));
  }, []);

  // ========================================
  // 주의사항 추가
  // ========================================
  const handleAddNotice = useCallback(() => {
    if (!newNotice.trim()) return;
    setSettings(prev => ({
      ...prev,
      notices: [...prev.notices, newNotice.trim()],
    }));
    setNewNotice('');
  }, [newNotice]);

  // ========================================
  // 주의사항 삭제
  // ========================================
  const handleRemoveNotice = useCallback((index: number) => {
    setSettings(prev => ({
      ...prev,
      notices: prev.notices.filter((_, i) => i !== index),
    }));
  }, []);

  // ========================================
  // 주의사항 수정
  // ========================================
  const handleUpdateNotice = useCallback((index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      notices: prev.notices.map((notice, i) => i === index ? value : notice),
    }));
  }, []);

  // ========================================
  // 로딩 중 UI
  // ========================================
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // 메인 렌더링
  // ========================================
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            환영 팝업 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            클로즈베타 환영 팝업의 내용을 관리합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ========================================
              좌측: 설정 폼
              ======================================== */}
          <div className="space-y-6">
            {/* 활성화 토글 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    팝업 활성화
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    활성화하면 첫 방문자에게 팝업이 표시됩니다
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings.enabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                기본 정보
              </h3>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="환영합니다! 🎉"
                />
              </div>

              {/* 부제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  부제목
                </label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tickerbird 클로즈베타"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="환영 메시지를 입력하세요..."
                />
              </div>

              {/* 버튼 텍스트 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  버튼 텍스트
                </label>
                <input
                  type="text"
                  value={settings.buttonText}
                  onChange={(e) => setSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="시작하기 🚀"
                />
              </div>
            </div>

            {/* 이미지 설정 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                상단 이미지
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                이미지가 없으면 기본 그라데이션이 표시됩니다
              </p>

              {settings.imageUrl ? (
                <div className="space-y-3">
                  <img
                    src={settings.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    이미지 삭제
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>업로드 중...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* 주의사항 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                주의사항 목록
              </h3>

              <div className="space-y-3 mb-4">
                {settings.notices.map((notice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-amber-500">•</span>
                    <input
                      type="text"
                      value={notice}
                      onChange={(e) => handleUpdateNotice(index, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleRemoveNotice(index)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* 새 주의사항 추가 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNotice()}
                  placeholder="새 주의사항 입력..."
                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddNotice}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </button>
          </div>

          {/* ========================================
              우측: 미리보기
              ======================================== */}
          <div className="lg:sticky lg:top-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              미리보기
            </h3>

            {/* 미리보기 컨테이너 */}
            <div className="bg-gray-100 dark:bg-gray-950 rounded-xl p-8 flex items-center justify-center min-h-[600px]">
              {/* 팝업 미리보기 */}
              <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* 상단 이미지 또는 그라데이션 */}
                {settings.imageUrl ? (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={settings.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl">🚀</span>
                    <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  </div>
                )}

                {/* 본문 */}
                <div className="px-6 py-5">
                  {settings.subtitle && (
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      {settings.subtitle}
                    </p>
                  )}

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {settings.title || '제목을 입력하세요'}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm">
                    {settings.description || '설명을 입력하세요'}
                  </p>

                  {settings.notices.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        클로즈베타 안내
                      </p>
                      <ul className="space-y-1.5">
                        {settings.notices.map((notice, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300"
                          >
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{notice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <label className="flex items-center gap-2 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      다시 보지 않기
                    </span>
                  </label>

                  <button
                    disabled
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl"
                  >
                    {settings.buttonText || '버튼 텍스트'}
                  </button>
                </div>
              </div>
            </div>

            {/* 상태 표시 */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.enabled ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {settings.enabled ? '팝업 활성화됨' : '팝업 비활성화됨'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
