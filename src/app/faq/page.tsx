'use client';

/**
 * FAQ 페이지 (사용자용)
 *
 * 자주 묻는 질문과 답변을 아코디언 형태로 표시합니다.
 * - 카테고리별 탭
 * - 질문 클릭 시 답변 펼침
 * - 순서대로 정렬
 *
 * ============================================================
 * 레이아웃:
 * ============================================================
 * - Sidebar (데스크톱)
 * - BottomNav (모바일)
 * - MobileSearchHeader (모바일)
 */

import { useState } from 'react';
import { useFAQ } from '@/hooks/useFAQ';
import { FAQ_CATEGORY_INFO } from '@/types/admin';
import type { FAQCategory, FAQ } from '@/types/admin';
import { Sidebar, BottomNav } from '@/components/layout';
import { MobileSearchHeader } from '@/components/features/search';

// ==================== 타입 정의 ====================

type FilterCategory = FAQCategory | 'all';

// ==================== FAQ 아이템 컴포넌트 ====================

function FAQItem({
  faq,
  isExpanded,
  onToggle,
}: {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* 질문 (클릭 가능) */}
      <button
        onClick={onToggle}
        className="w-full py-4 px-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">Q</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {faq.question}
          </span>
        </div>
        {/* 화살표 아이콘 */}
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 답변 (펼침) */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex items-start gap-3 pl-0">
            <span className="text-green-600 dark:text-green-400 font-bold">A</span>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================

export default function FAQPage() {
  const { faqs, isLoading, error } = useFAQ({ publishedOnly: true });
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeMenu] = useState('faq');

  // 카테고리 필터링
  const filteredFaqs = filterCategory === 'all'
    ? faqs
    : faqs.filter((f) => f.category === filterCategory);

  // 카테고리 목록 (존재하는 카테고리만)
  const availableCategories = Array.from(
    new Set(faqs.map((f) => f.category))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
      {/* 모바일 헤더 */}
      <MobileSearchHeader title="FAQ" />

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
              ❓ 자주 묻는 질문
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              AlphaBoard 이용에 관해 자주 묻는 질문과 답변입니다.
            </p>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="h-full px-4 flex items-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 표시 */}
          {error && !isLoading && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* 카테고리 탭 */}
          {!isLoading && availableCategories.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                전체
              </button>
              {availableCategories.map((cat) => {
                const info = FAQ_CATEGORY_INFO[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterCategory === cat
                        ? 'bg-blue-600 text-white'
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

          {/* FAQ 목록 */}
          {!isLoading && filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 dark:text-gray-400">
                {filterCategory === 'all'
                  ? '아직 FAQ가 없습니다.'
                  : '해당 카테고리의 FAQ가 없습니다.'}
              </p>
            </div>
          ) : !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedId === faq.id}
                  onToggle={() => setExpandedId(
                    expandedId === faq.id ? null : faq.id
                  )}
                />
              ))}
            </div>
          )}

          {/* 추가 문의 안내 */}
          {!isLoading && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                원하는 답변을 찾지 못하셨나요?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                커뮤니티에서 질문하거나 이메일로 문의해 주세요.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="/community"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  커뮤니티 가기
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
