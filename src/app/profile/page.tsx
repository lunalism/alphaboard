'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSettings } from '@/types';
import { Sidebar, BottomNav } from '@/components/layout';
import {
  ProfileLoginPrompt,
  ProfileCard,
  ActivitySummaryCard,
  SettingsSection,
} from '@/components/features/profile';
import {
  dummyUserProfile,
  dummyActivitySummary,
  defaultUserSettings,
} from '@/constants';
import { useAuthStore } from '@/stores';

export default function ProfilePage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('profile');
  const { isLoggedIn, toggleLogin, login, logout } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditProfile = () => {
    alert('프로필 수정 기능은 준비 중입니다.');
  };

  const handleTestToggle = () => {
    if (isLoggedIn) {
      // 로그인 상태에서 토글 OFF → 즉시 로그아웃 후 홈으로 이동
      toggleLogin();
      router.push('/');
    } else {
      // 비로그인 상태에서 토글 ON
      toggleLogin();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    router.push('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sidebar - hidden on mobile */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Bottom Navigation - visible only on mobile */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">프로필</h1>
              <p className="text-gray-500 text-sm">계정 정보와 설정을 관리하세요</p>
            </div>

            {/* Login Test Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">로그인 테스트</span>
              <button
                onClick={handleTestToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isLoggedIn ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isLoggedIn ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {!isLoggedIn ? (
            <ProfileLoginPrompt onLogin={login} />
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              <ProfileCard profile={dummyUserProfile} onEdit={handleEditProfile} />

              {/* Activity Summary */}
              <ActivitySummaryCard activity={dummyActivitySummary} />

              {/* Settings */}
              <SettingsSection
                settings={settings}
                onSettingsChange={setSettings}
                onLogout={handleLogoutClick}
              />
            </div>
          )}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleLogoutCancel}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">로그아웃</h3>
            <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
