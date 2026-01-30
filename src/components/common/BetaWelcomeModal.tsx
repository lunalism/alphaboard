'use client';

/**
 * BetaWelcomeModal - 클로즈베타 환영 팝업
 *
 * 첫 방문 사용자에게 환영 메시지와 주의사항을 표시합니다.
 * 관리자가 Firestore에서 내용을 관리할 수 있습니다.
 *
 * ============================================================
 * 동작 방식:
 * ============================================================
 * 1. Firestore에서 welcomePopup 설정 로드
 * 2. enabled가 false면 팝업 표시 안 함
 * 3. localStorage에 'betaWelcomeSeen' 키로 표시 여부 관리
 * 4. "다시 보지 않기" 체크하면 영구 숨김
 *
 * ============================================================
 * Firestore 경로:
 * ============================================================
 * settings/welcomePopup
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  subtitle: 'AlphaBoard 클로즈베타',
  description: '글로벌 투자 정보 플랫폼 AlphaBoard의 클로즈베타에 참여해주셔서 감사합니다!',
  imageUrl: null,
  notices: [
    '서비스가 불안정할 수 있습니다',
    '데이터가 초기화될 수 있습니다',
    '버그 발견 시 커뮤니티에 제보해주세요',
    '여러분의 피드백이 큰 도움이 됩니다!',
  ],
  buttonText: '시작하기 🚀',
};

/** localStorage 키 */
const STORAGE_KEY = 'alphaboard_beta_welcome_seen';

// ============================================
// 메인 컴포넌트
// ============================================

export function BetaWelcomeModal() {
  // 팝업 표시 상태
  const [isOpen, setIsOpen] = useState(false);
  // 설정 데이터
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  // "다시 보지 않기" 체크 상태
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // Firestore에서 설정 로드
  // ========================================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // localStorage 확인 - 이미 본 경우 스킵
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen === 'true') {
          setIsLoading(false);
          return;
        }

        // Firestore에서 설정 로드
        const docRef = doc(db, 'settings', 'welcomePopup');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as WelcomePopupSettings;
          setSettings(data);

          // enabled가 true일 때만 팝업 표시
          if (data.enabled) {
            setIsOpen(true);
          }
        } else {
          // 문서가 없으면 기본값 사용
          setSettings(DEFAULT_SETTINGS);
          if (DEFAULT_SETTINGS.enabled) {
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error('[BetaWelcomeModal] 설정 로드 실패:', error);
        // 에러 시 기본값 사용
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ========================================
  // 팝업 닫기 핸들러
  // ========================================
  const handleClose = useCallback(() => {
    // "다시 보지 않기" 체크되어 있으면 localStorage에 저장
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsOpen(false);
  }, [dontShowAgain]);

  // ========================================
  // 렌더링
  // ========================================

  // 로딩 중이거나 팝업이 닫혔거나 설정이 없으면 렌더링 안 함
  if (isLoading || !isOpen || !settings) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 팝업 컨텐츠 */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* 상단 이미지 또는 그라데이션 영역 */}
        {settings.imageUrl ? (
          // 이미지가 있는 경우
          <div className="relative h-40 overflow-hidden">
            <img
              src={settings.imageUrl}
              alt="Welcome"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          // 이미지가 없는 경우 그라데이션 + 이모지
          <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🚀</span>
            {/* 장식용 원형 */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          </div>
        )}

        {/* 본문 내용 */}
        <div className="px-6 py-5">
          {/* 부제목 */}
          {settings.subtitle && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              {settings.subtitle}
            </p>
          )}

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {settings.title}
          </h2>

          {/* 설명 */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {settings.description}
          </p>

          {/* 주의사항 목록 */}
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
                    className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{notice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 다시 보지 않기 체크박스 */}
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              다시 보지 않기
            </span>
          </label>

          {/* 시작하기 버튼 */}
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {settings.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BetaWelcomeModal;
