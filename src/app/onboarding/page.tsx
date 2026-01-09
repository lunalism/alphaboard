'use client';

/**
 * 온보딩 페이지
 *
 * 신규 사용자가 닉네임을 설정하는 페이지입니다.
 * Google 로그인 후 profiles 테이블에 name이 없으면 이 페이지로 리다이렉트됩니다.
 *
 * 플로우:
 * 1. Google 로그인 성공
 * 2. Auth Callback에서 신규 사용자 감지 → /onboarding 리다이렉트
 * 3. 닉네임 입력 → profiles 테이블에 저장
 * 4. 홈으로 이동
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { showSuccess, showError } from '@/lib/toast';

export default function OnboardingPage() {
  const router = useRouter();

  // 전역 인증 상태 사용
  const { user, userProfile, isLoading, isLoggedIn, isNewUser, updateProfile } = useAuth();

  // 로컬 상태
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 닉네임 유효성 검사
   * - 2-20자
   * - 한글, 영문, 숫자만 허용
   */
  const validateNickname = (value: string): string | null => {
    if (value.length < 2) return '닉네임은 2자 이상이어야 합니다';
    if (value.length > 20) return '닉네임은 20자 이하여야 합니다';
    const regex = /^[가-힣a-zA-Z0-9]+$/;
    if (!regex.test(value)) return '한글, 영문, 숫자만 사용할 수 있습니다';
    return null;
  };

  /**
   * 접근 권한 확인
   * - 비로그인 → /login
   * - 이미 닉네임 있음 → /
   */
  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      // 비로그인 사용자 → 로그인 페이지로
      console.log('[Onboarding] 비로그인 → /login');
      router.replace('/login');
      return;
    }

    if (!isNewUser && userProfile?.name) {
      // 이미 닉네임이 있는 사용자 → 홈으로
      console.log('[Onboarding] 기존 사용자 → /');
      router.replace('/');
      return;
    }

    console.log('[Onboarding] 신규 사용자, 닉네임 입력 필요');
  }, [isLoading, isLoggedIn, isNewUser, userProfile, router]);

  /**
   * 닉네임 저장 제출
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // AuthProvider의 updateProfile 사용
      await updateProfile(nickname.trim());

      showSuccess('환영합니다! 🎉');

      // 홈으로 이동 (전체 새로고침으로 상태 동기화)
      window.location.href = '/';
    } catch (err) {
      console.error('[Onboarding] 저장 에러:', err);
      showError('닉네임 저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 닉네임 입력 변경 핸들러
   */
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    // 에러가 있었으면 다시 검사
    if (error) {
      setError(validateNickname(value));
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인 상태 (리다이렉트 대기 중)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              AlphaBoard에 오신 것을
            </h1>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              환영합니다!
            </p>
          </div>

          {/* 프로필 이미지 */}
          <div className="flex justify-center mb-8">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900">
                <span className="text-4xl text-white font-bold">
                  {userProfile?.email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>

          {/* 닉네임 입력 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                사용할 닉네임을 입력해주세요
              </label>
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg ${
                  error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
                disabled={isSaving}
                maxLength={20}
                autoFocus
              />
              {error ? (
                <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                  2-20자, 한글/영문/숫자만 사용 가능
                </p>
              )}
            </div>

            {/* 이메일 표시 (읽기 전용) */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                {userProfile?.email}
              </p>
            </div>

            {/* 시작하기 버튼 */}
            <button
              type="submit"
              disabled={isSaving || !nickname.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                '시작하기'
              )}
            </button>
          </form>
        </div>

        {/* 푸터 */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          닉네임은 나중에 프로필에서 변경할 수 있습니다
        </p>
      </div>
    </div>
  );
}
