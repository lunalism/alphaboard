'use client';

/**
 * 관리자 - 개인정보처리방침 편집 페이지
 *
 * 개인정보처리방침을 마크다운으로 작성하고 저장할 수 있습니다.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteContent } from '@/hooks/useSiteContent';
import { ContentEditor } from '@/components/admin';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export default function AdminPrivacyPage() {
  const { userProfile } = useAuth();
  const { content, isLoading, isSaving, error, saveContent } = useSiteContent('privacy');

  // 편집 중인 데이터 상태
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 콘텐츠 로드 시 편집 상태 초기화
  useEffect(() => {
    if (content) {
      setEditTitle(content.title);
      setEditContent(content.content);
    }
  }, [content]);

  // 저장 핸들러
  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    if (!editContent.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    try {
      await saveContent(editTitle, editContent, userProfile?.email || 'admin');
      toast.success('개인정보처리방침이 저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div>
        {/* 뒤로가기 스켈레톤 */}
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />

        {/* 페이지 헤더 스켈레톤 */}
        <div className="mb-8">
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* 편집기 스켈레톤 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="space-y-6">
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        콘텐츠 관리
      </Link>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          개인정보처리방침 편집
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          개인정보처리방침을 작성하고 저장합니다. 마크다운 문법을 지원합니다.
        </p>
      </div>

      {/* 미리보기 링크 */}
      <div className="mb-6">
        <Link
          href="/privacy"
          target="_blank"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          사용자 페이지에서 보기
        </Link>
      </div>

      {/* 편집기 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <ContentEditor
          title={editTitle}
          content={editContent}
          onTitleChange={setEditTitle}
          onContentChange={setEditContent}
          onSave={handleSave}
          isSaving={isSaving}
          lastUpdated={
            content?.updatedAt
              ? {
                  date: content.updatedAt.toDate(),
                  by: content.updatedBy,
                }
              : undefined
          }
          error={error}
        />
      </div>
    </div>
  );
}
