'use client';

import Link from 'next/link';
import { GlossaryTerm } from '@/types';

/**
 * 용어 설명 섹션 컴포넌트
 *
 * 데스크톱/태블릿에서 이벤트 패널 하단에 표시되는 용어 설명 영역
 * 용어 hover/tap 시 해당 용어의 상세 정보 표시
 */
interface GlossaryExplainerProps {
  selectedTerm: GlossaryTerm | null;
  className?: string;
}

export function GlossaryExplainer({ selectedTerm, className = '' }: GlossaryExplainerProps) {
  // 선택된 용어가 없을 때
  if (!selectedTerm) {
    return (
      <div
        className={`bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">
            이벤트의 <span className="text-blue-500 dark:text-blue-400">파란색 용어</span>에
            마우스를 올리면 설명이 표시됩니다
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 transition-all duration-300 ${className}`}
    >
      {/* 헤더: 약어 + 한글명 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {selectedTerm.abbreviation}
        </span>
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          {selectedTerm.korean}
        </span>
      </div>

      {/* 영문 전체명 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{selectedTerm.fullName}</p>

      {/* 설명 */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
        {selectedTerm.description}
      </p>

      {/* 용어사전 링크 */}
      <Link
        href={`/glossary?search=${selectedTerm.abbreviation}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        용어사전에서 더 보기
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
