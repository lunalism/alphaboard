'use client';

/**
 * 공지사항 페이지 (사용자용)
 *
 * 발행된 공지사항 목록을 표시합니다.
 *
 * ============================================================
 * 반응형 레이아웃:
 * ============================================================
 * - 데스크톱/태블릿 (≥768px): 좌우 분할 레이아웃
 *   - 왼쪽 (35%): 공지사항 목록
 *   - 오른쪽 (65%): 선택된 공지사항 내용
 *
 * - 모바일 (<768px): 아코디언 형태
 *
 * ============================================================
 * 읽음 처리 로직:
 * ============================================================
 * - 공지를 클릭하면 읽음 처리
 * - useNewAnnouncement 훅의 markAsRead 호출
 * - 모든 공지를 읽어야 사이드바 배지가 사라짐
 */

import { useState, useCallback, useEffect } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useNewAnnouncement } from '@/hooks/useNewAnnouncement';
import { ANNOUNCEMENT_CATEGORY_INFO } from '@/types/admin';
import type { AnnouncementCategory, Announcement } from '@/types/admin';
import { Sidebar, BottomNav } from '@/components/layout';
import { MobileSearchHeader } from '@/components/features/search';

// ==================== 타입 정의 ====================

type FilterCategory = AnnouncementCategory | 'all';

// ==================== 목록 아이템 컴포넌트 (데스크톱) ====================

/**
 * 공지사항 목록 아이템 (좌측 패널용)
 *
 * 클릭하면 오른쪽에 내용을 표시합니다.
 */
function AnnouncementListItem({
  announcement,
  isSelected,
  isUnread,
  onSelect,
}: {
  announcement: Announcement;
  isSelected: boolean;
  isUnread: boolean;
  onSelect: () => void;
}) {
  const categoryInfo = ANNOUNCEMENT_CATEGORY_INFO[announcement.category];
  const dateStr = announcement.createdAt?.toDate?.()?.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  }) || '';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 transition-colors relative ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {/* 선택 표시 바 */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}

      {/* 카테고리 + 날짜 */}
      <div className="flex items-center gap-2 mb-1.5">
        {announcement.isPinned && (
          <span className="text-yellow-500 text-sm" title="상단 고정">📌</span>
        )}
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded"
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
          {categoryInfo.icon} {categoryInfo.label}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
          {dateStr}
        </span>
      </div>

      {/* 제목 */}
      <h3 className={`text-sm font-medium line-clamp-2 ${
        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
      }`}>
        {announcement.title}
        {/* 읽지 않은 공지 배지 */}
        {isUnread && (
          <span className="inline-flex items-center ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
            N
          </span>
        )}
      </h3>
    </button>
  );
}

// ==================== 내용 뷰어 컴포넌트 (데스크톱) ====================

/**
 * 공지사항 내용 뷰어 (우측 패널용)
 *
 * 선택된 공지사항의 전체 내용을 표시합니다.
 */
function AnnouncementViewer({ announcement }: { announcement: Announcement | null }) {
  if (!announcement) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">공지사항을 선택해주세요</p>
        <p className="text-sm mt-1">왼쪽 목록에서 공지사항을 클릭하면 내용이 표시됩니다.</p>
      </div>
    );
  }

  const categoryInfo = ANNOUNCEMENT_CATEGORY_INFO[announcement.category];
  const dateStr = announcement.createdAt?.toDate?.()?.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) || '';

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* 헤더 */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-2 mb-3">
          {announcement.isPinned && (
            <span className="text-yellow-500" title="상단 고정">📌</span>
          )}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
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
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {dateStr}
          </span>
        </div>
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {announcement.title}
        </h1>
      </div>

      {/* 내용 */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: announcement.content }}
      />
    </div>
  );
}

// ==================== 아코디언 카드 컴포넌트 (모바일) ====================

/**
 * 공지사항 아코디언 카드 (모바일용)
 *
 * 클릭하면 내용이 펼쳐지는 아코디언 형태입니다.
 */
function AnnouncementAccordion({
  announcement,
  isExpanded,
  isUnread,
  onToggle,
}: {
  announcement: Announcement;
  isExpanded: boolean;
  isUnread: boolean;
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
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
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
          {/* 제목 + 읽지 않음 배지 */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            {announcement.title}
            {isUnread && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                N
              </span>
            )}
          </h3>
        </div>
        {/* 화살표 아이콘 */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null); // 모바일 아코디언용
  const [activeMenu] = useState('announcements');

  // 새 공지사항 읽음 처리 훅
  const { markAsRead, isRead } = useNewAnnouncement();

  // 카테고리 필터링
  const filteredAnnouncements = filterCategory === 'all'
    ? announcements
    : announcements.filter((a) => a.category === filterCategory);

  // 선택된 공지사항
  const selectedAnnouncement = filteredAnnouncements.find((a) => a.id === selectedId) || null;

  // 카테고리 목록 (존재하는 카테고리만)
  const availableCategories = Array.from(
    new Set(announcements.map((a) => a.category))
  );

  // 첫 번째 공지사항 자동 선택 (데스크톱)
  useEffect(() => {
    if (!selectedId && filteredAnnouncements.length > 0) {
      // 데스크톱에서만 자동 선택
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setSelectedId(filteredAnnouncements[0].id);
        markAsRead(filteredAnnouncements[0].id);
      }
    }
  }, [filteredAnnouncements, selectedId, markAsRead]);

  /**
   * 공지사항 선택 핸들러 (데스크톱)
   */
  const handleSelect = useCallback((announcementId: string) => {
    setSelectedId(announcementId);
    markAsRead(announcementId);
  }, [markAsRead]);

  /**
   * 공지사항 토글 핸들러 (모바일 아코디언)
   */
  const handleToggle = useCallback((announcementId: string) => {
    if (expandedId !== announcementId) {
      markAsRead(announcementId);
    }
    setExpandedId(expandedId === announcementId ? null : announcementId);
  }, [expandedId, markAsRead]);

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
        {/* ============================================================
            데스크톱/태블릿: 좌우 분할 레이아웃 (768px 이상)
            ============================================================ */}
        <div className="hidden md:flex h-[calc(100vh-0px)]">
          {/* 왼쪽: 공지사항 목록 */}
          <div className="w-[35%] min-w-[280px] max-w-[400px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📢 공지사항
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AlphaBoard의 새로운 소식
              </p>
            </div>

            {/* 카테고리 필터 */}
            {availableCategories.length > 1 && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                        filterCategory === cat
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm">공지사항이 없습니다.</p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <AnnouncementListItem
                    key={announcement.id}
                    announcement={announcement}
                    isSelected={selectedId === announcement.id}
                    isUnread={!isRead(announcement.id)}
                    onSelect={() => handleSelect(announcement.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* 오른쪽: 선택된 공지사항 내용 */}
          <div className="flex-1 bg-white dark:bg-gray-900">
            {isLoading ? (
              <div className="p-8 space-y-4">
                <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-8" />
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              </div>
            ) : (
              <AnnouncementViewer announcement={selectedAnnouncement} />
            )}
          </div>
        </div>

        {/* ============================================================
            모바일: 아코디언 형태 (768px 미만)
            ============================================================ */}
        <div className="md:hidden px-4 py-6 pb-24">
          {/* 페이지 헤더 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              📢 공지사항
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AlphaBoard의 새로운 소식과 업데이트
            </p>
          </div>

          {/* 카테고리 필터 */}
          {availableCategories.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
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
                    {info.icon} {info.label}
                  </button>
                );
              })}
            </div>
          )}

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
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* 공지사항 목록 (아코디언) */}
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
            <div className="space-y-3">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementAccordion
                  key={announcement.id}
                  announcement={announcement}
                  isExpanded={expandedId === announcement.id}
                  isUnread={!isRead(announcement.id)}
                  onToggle={() => handleToggle(announcement.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
