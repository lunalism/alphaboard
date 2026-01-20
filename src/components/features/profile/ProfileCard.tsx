'use client';

/**
 * ProfileCard - 프로필 카드 컴포넌트
 *
 * 사용자 프로필 정보를 표시하는 카드 컴포넌트입니다.
 * 아바타, 닉네임, 이메일, 가입일 등을 표시합니다.
 *
 * 아바타 표시 우선순위:
 * 1. avatarId가 있으면 → /avatars/avatar-{id}.png 표시
 * 2. avatar(photoURL)이 있으면 → Google 프로필 사진 표시
 * 3. 둘 다 없으면 → 닉네임 첫 글자로 이니셜 아바타 표시
 */

import { UserAvatar } from '@/components/common';
import { UserProfile } from '@/types';

/**
 * ProfileCard 컴포넌트 Props
 */
interface ProfileCardProps {
  /** 사용자 프로필 정보 */
  profile: UserProfile & { avatarId?: string };
  /** 프로필 수정 버튼 클릭 핸들러 */
  onEdit: () => void;
  /** 로그아웃 버튼 클릭 핸들러 */
  onLogout: () => void;
  /** 아바타 클릭 핸들러 (아바타 선택 모달 열기) */
  onAvatarClick?: () => void;
}

export function ProfileCard({ profile, onEdit, onLogout, onAvatarClick }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar - 클릭하여 아바타 변경 가능 */}
        <div
          className="relative group cursor-pointer"
          onClick={onAvatarClick}
        >
          {/* 아바타 이미지 (UserAvatar 컴포넌트 사용) */}
          <UserAvatar
            avatarId={profile.avatarId}
            photoURL={profile.avatar}
            name={profile.name}
            size="xl"
          />

          {/* 호버 시 "변경" 오버레이 */}
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">변경</span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">{profile.email}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              가입일: {profile.joinDate}
            </span>
          </p>

          {/* Action Buttons - 모바일에서 프로필 정보 아래에 표시 */}
          <div className="flex gap-2 mt-4 sm:hidden">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              수정
            </button>
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>

        {/* Action Buttons - 데스크탑에서 우측 상단에 표시 */}
        <div className="hidden sm:flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            프로필 수정
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
