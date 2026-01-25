'use client';

/**
 * ContentEditor - 마크다운 콘텐츠 편집기 컴포넌트
 *
 * 개인정보처리방침, 이용약관 등 마크다운 콘텐츠를 편집합니다.
 * 편집 모드와 미리보기 모드를 지원합니다.
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentEditorProps {
  // 제목
  title: string;
  // 본문 (Markdown)
  content: string;
  // 제목 변경 핸들러
  onTitleChange: (title: string) => void;
  // 본문 변경 핸들러
  onContentChange: (content: string) => void;
  // 저장 핸들러
  onSave: () => void;
  // 저장 중 상태
  isSaving: boolean;
  // 마지막 수정 정보
  lastUpdated?: {
    date: Date;
    by: string;
  };
  // 에러 메시지
  error?: string | null;
}

export function ContentEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  isSaving,
  lastUpdated,
  error,
}: ContentEditorProps) {
  // 미리보기 모드 상태
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="space-y-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 제목 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="제목을 입력하세요"
        />
      </div>

      {/* 편집기 / 미리보기 탭 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !isPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            편집
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            미리보기
          </button>
        </div>

        {/* 편집 모드 */}
        {!isPreview ? (
          <div>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="마크다운 형식으로 내용을 작성하세요..."
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              마크다운 문법을 지원합니다. (# 제목, ## 소제목, **굵게**, *기울임*, - 목록 등)
            </p>
          </div>
        ) : (
          /* 미리보기 모드 */
          <div className="min-h-[500px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
            <article className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*내용이 없습니다.*'}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>

      {/* 저장 버튼 및 마지막 수정 정보 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {lastUpdated ? (
            <>
              마지막 수정:{' '}
              {lastUpdated.date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              by {lastUpdated.by}
            </>
          ) : (
            '아직 저장된 내용이 없습니다.'
          )}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              저장 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              저장
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ContentEditor;
