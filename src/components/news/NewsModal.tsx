'use client';

/**
 * NewsModal - AI 재작성 뉴스 모달 컴포넌트
 *
 * 데스크톱/태블릿에서 뉴스 클릭 시 표시되는 모달입니다.
 *
 * ============================================================
 * 기능:
 * ============================================================
 * - 모달 오픈 시 자동으로 AI 재작성 API 호출
 * - 배경 클릭 또는 X 버튼으로 닫기
 * - ESC 키로 닫기
 * - 스크롤 잠금 (모달 열린 상태에서 배경 스크롤 방지)
 */

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { NewsContent } from './NewsContent';
import { RewrittenNewsContent, RewriteNewsResponse } from '@/types/rewritten-news';
import { CrawledNewsItem } from '@/types/crawled-news';

// ============================================
// Props 타입 정의
// ============================================

interface NewsModalProps {
  /** 표시할 뉴스 아이템 */
  news: CrawledNewsItem;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
}

// ============================================
// 메인 컴포넌트
// ============================================

export function NewsModal({ news, onClose }: NewsModalProps) {
  // AI 재작성 콘텐츠 상태
  const [rewrittenContent, setRewrittenContent] = useState<RewrittenNewsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 상태 (포탈 렌더링용)
  const [mounted, setMounted] = useState(false);

  // ========================================
  // 마운트 시 처리
  // ========================================
  useEffect(() => {
    setMounted(true);

    // 스크롤 잠금
    document.body.style.overflow = 'hidden';

    return () => {
      // 스크롤 복원
      document.body.style.overflow = '';
    };
  }, []);

  // ========================================
  // ESC 키 핸들러
  // ========================================
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // ========================================
  // AI 재작성 API 호출
  // ========================================
  useEffect(() => {
    const fetchRewrittenContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/news/rewrite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newsId: news.id,
            url: news.url,
            title: news.title,
            source: news.source,
            content: news.description || undefined,
          }),
        });

        const data: RewriteNewsResponse = await response.json();

        if (data.success && data.data) {
          setRewrittenContent({
            summary: data.data.summary,
            content: data.data.content,
            investmentPoints: data.data.investmentPoints,
            relatedStocks: data.data.relatedStocks,
            sentiment: data.data.sentiment,
          });
        } else {
          setError(data.error || 'AI 재작성에 실패했습니다.');
        }
      } catch (err) {
        console.error('[NewsModal] API 에러:', err);
        setError('뉴스를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewrittenContent();
  }, [news]);

  // ========================================
  // 배경 클릭 핸들러
  // ========================================
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // 마운트 전에는 렌더링하지 않음
  if (!mounted) return null;

  // ========================================
  // 모달 렌더링 (포탈 사용)
  // ========================================
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* 모달 컨테이너 */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 닫기 버튼 */}
        <div className="flex items-center justify-end px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <NewsContent
            title={news.title}
            source={news.source}
            publishedAt={news.publishedAt}
            originalUrl={news.url}
            rewrittenContent={rewrittenContent}
            isLoading={isLoading}
            error={error}
            thumbnailUrl={news.thumbnail}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default NewsModal;
