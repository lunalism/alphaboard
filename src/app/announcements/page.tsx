'use client';

/**
 * 공지사항 페이지 (사용자용)
 *
 * 발행된 공지사항 목록을 표시합니다.
 * - 카드 형태의 목록
 * - 카테고리 필터
 * - 상단 고정 공지 표시
 * - 클릭 시 아코디언 펼침
 *
 * ============================================================
 * 레이아웃:
 * ============================================================
 * - Sidebar (데스크톱)
 * - BottomNav (모바일)
 * - MobileSearchHeader (모바일)
 */

import { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { ANNOUNCEMENT_CATEGORY_INFO } from '@/types/admin';
import type { AnnouncementCategory, Announcement } from '@/types/admin';
import { Sidebar, BottomNav } from '@/components/layout';
import { MobileSearchHeader } from '@/components/features/search';

// ==================== 타입 정의 ====================

type FilterCategory = AnnouncementCategory | 'all';

// ==================== 공지사항 카드 컴포넌트 ====================

function AnnouncementCard({
  announcement,
  isExpanded,
  onToggle,
}: {
  announcement: Announcement;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryInfo = ANNOUNCEMENT_CATEGORY_INFO[announcement.category];
  const dateStr = announcement.createdAt?.toDate?.()?.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) || '';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
        announcement.isPinned
          ? 'border-yellow-300 dark:border-yellow-600 shadow-md'
          : 'border-gray-200 dark:border-gray-700 shadow-sm'
      }`}
    >
      {/* 헤더 (클릭 가능) */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-t-xl"
      >
        <div className="flex-1 min-w-0">
          {/* 카테고리 + 날짜 */}
          <div className="flex items-center gap-2 mb-2">
            {announcement.isPinned && (
              <span className="text-yellow-500" title="상단 고정">📌</span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full`}
              style={{
                backgroundColor: categoryInfo.color === 'blue' ? '#dbeafe' :
                                 categoryInfo.color === 'green' ? '#dcfce7' :
                                 categoryInfo.color === 'purple' ? '#f3e8ff' :
                                 categoryInfo.color === 'orange' ? '#ffedd5' : '#f3f4f6',
                color: categoryInfo.color === 'blue' ? '#1d4ed8' :
                       categoryInfo.color === 'green' ? '#15803d' :
                       categoryInfo.color === 'purple' ? '#7e22ce' :
                       categoryInfo.color === 'orange' ? '#c2410c' : '#374151',
              }}
            >
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.label}</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {dateStr}
            </span>
          </div>
          {/* 제목 */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {announcement.title}
          </h3>
        </div>
        {/* 화살표 아이콘 */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 내용 (펼침) */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div
            className="pt-4 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
      )}
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

export default function AnnouncementsPage() {
  const { announcements, isLoading, error } = useAnnouncements({ publishedOnly: true });
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeMenu] = useState('announcements');

  // 카테고리 필터링
  const filteredAnnouncements = filterCategory === 'all'
    ? announcements
    : announcements.filter((a) => a.category === filterCategory);

  // 카테고리 목록 (존재하는 카테고리만)
  const availableCategories = Array.from(
    new Set(announcements.map((a) => a.category))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
      {/* 모바일 헤더 */}
      <MobileSearchHeader title="공지사항" />

      {/* Sidebar - 데스크톱 */}
      <Sidebar activeMenu={activeMenu} />

      {/* Bottom Navigation - 모바일 */}
      <BottomNav activeMenu={activeMenu} />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300 pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📢 공지사항
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              AlphaBoard의 새로운 소식과 업데이트를 확인하세요.
            </p>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* 에러 표시 */}
          {error && !isLoading && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* 카테고리 필터 */}
          {!isLoading && availableCategories.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                전체
              </button>
              {availableCategories.map((cat) => {
                const info = ANNOUNCEMENT_CATEGORY_INFO[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filterCategory === cat
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 공지사항 목록 */}
          {!isLoading && filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-gray-400">
                {filterCategory === 'all'
                  ? '아직 공지사항이 없습니다.'
                  : '해당 카테고리의 공지사항이 없습니다.'}
              </p>
            </div>
          ) : !isLoading && (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isExpanded={expandedId === announcement.id}
                  onToggle={() => setExpandedId(
                    expandedId === announcement.id ? null : announcement.id
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
