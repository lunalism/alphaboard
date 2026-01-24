"use client";

/**
 * Sidebar 컴포넌트
 *
 * 좌측 사이드바 네비게이션입니다.
 * 전역 AuthContext를 사용하여 인증 상태를 표시합니다.
 * 페이지 이동해도 상태가 유지됩니다.
 */

import { useState } from "react";
import Link from "next/link";
import { menuItems } from '@/constants';
import { MenuIcon, UserAvatar } from '@/components/common';
import { useAuth } from '@/components/providers/AuthProvider';

interface SidebarProps {
  activeMenu: string;
  onMenuChange?: (id: string) => void;
}

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const [mounted, setMounted] = useState(false);

  // 전역 인증 상태 사용 (자체 세션 체크 없음)
  const { userProfile, isLoading, isLoggedIn, isTestMode, isProfileLoading } = useAuth();

  // 클라이언트 마운트 확인 (hydration 방지)
  useState(() => {
    setMounted(true);
  });


  // 사용자 정보 (우선순위: nickname > displayName > 기본값)
  // AlphaBoard 닉네임이 있으면 최우선, 없으면 Google displayName 사용
  const userName = userProfile?.nickname || userProfile?.displayName || '사용자';
  const userAvatar = userProfile?.avatarUrl;

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col py-4 z-50 transition-all duration-300 w-[72px] lg:w-60">
      {/* Logo */}
      <div className="px-4 mb-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden lg:block">AlphaBoard</span>
        </Link>
      </div>

      {/* ========================================
          메뉴 영역
          - flex-1: 남은 공간 차지
          - overflow-y-auto: 메뉴가 많으면 스크롤
          - 로그인 버튼은 항상 하단에 고정
          ======================================== */}
      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-hide">
        {menuItems
          .filter((item) => item.id !== 'profile')
          // 가격 알림과 관심종목은 로그인 시에만 표시 (로딩 완료 후에만 체크)
          .filter((item) => item.id !== 'alerts' || (!isLoading && isLoggedIn))
          .filter((item) => item.id !== 'watchlist' || (!isLoading && isLoggedIn))
          .map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`group relative w-full h-12 rounded-xl flex items-center transition-all duration-200 flex-shrink-0 ${
              activeMenu === item.id
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
            title={item.label}
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <MenuIcon icon={item.icon} active={activeMenu === item.id} />
            </div>
            <span className={`text-sm font-medium hidden lg:block ${
              activeMenu === item.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            }`}>
              {item.label}
            </span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap lg:hidden z-50">
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      {/* ========================================
          로그인/프로필 섹션
          - mt-auto: 항상 하단으로 밀어냄
          - flex-shrink-0: 절대 축소되지 않음
          ======================================== */}
      <div className="px-3 pt-2 mt-auto flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
        {isLoading || isProfileLoading ? (
          // 로딩 중 - 스켈레톤 UI
          <div className="w-full h-12 rounded-xl flex items-center px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
            <div className="hidden lg:block ml-3 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ) : isLoggedIn && userProfile ? (
          // 로그인됨 - 프로필 표시
          // UserAvatar 컴포넌트 사용 (avatarId 우선, 없으면 avatarUrl, 없으면 이니셜)
          <Link
            href="/profile"
            className="group relative w-full h-12 rounded-xl flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title={isTestMode ? `${userName} (테스트 모드)` : userName}
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative">
              {/* UserAvatar 컴포넌트 사용 - avatarId > avatarUrl > 이니셜 우선순위 */}
              <UserAvatar
                avatarId={userProfile.avatarId}
                photoURL={userAvatar}
                name={userName}
                size="sm"
                isTestMode={isTestMode}
              />
            </div>
            <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                {userName}
              </span>
              {/* 테스트 모드 표시 (데스크톱) */}
              {isTestMode && (
                <span className="text-[10px] text-orange-500 font-medium">테스트 모드</span>
              )}
            </div>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap lg:hidden z-50">
              {userName}{isTestMode ? ' (테스트)' : ''}
            </div>
          </Link>
        ) : (
          // 비로그인 - 로그인 버튼
          <Link
            href="/login"
            className="group relative w-full h-12 rounded-xl flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="로그인"
          >
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">로그인</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap lg:hidden z-50">
              로그인
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
