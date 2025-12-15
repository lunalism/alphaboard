'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getGlossaryTermByAbbreviation } from '@/constants';

/**
 * 용어사전 툴팁 컴포넌트
 *
 * 용어 hover 시 간단한 설명을 툴팁으로 표시하고,
 * "자세히 보기" 클릭 시 용어사전 페이지로 이동
 *
 * @example
 * <GlossaryTooltip term="CPI">CPI 발표</GlossaryTooltip>
 */
interface GlossaryTooltipProps {
  term: string; // 영문 약어 (예: CPI, FOMC)
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 용어 데이터 조회
  const glossaryTerm = getGlossaryTermByAbbreviation(term);

  // 툴팁 위치 계산
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current.offsetHeight;

      // 화면 상단에 공간이 부족하면 아래에 표시
      if (triggerRect.top < tooltipHeight + 20) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  // 용어가 없으면 일반 텍스트로 표시
  if (!glossaryTerm) {
    return <span>{children}</span>;
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* 트리거 텍스트 (밑줄 + 점선) */}
      <span className="border-b border-dashed border-blue-400 dark:border-blue-500 cursor-help text-blue-600 dark:text-blue-400">
        {children}
      </span>

      {/* 툴팁 */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-72 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${
            position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
          }`}
        >
          {/* 툴팁 화살표 */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rotate-45 ${
              position === 'top'
                ? 'bottom-[-6px] border-r border-b'
                : 'top-[-6px] border-l border-t'
            }`}
          />

          {/* 툴팁 내용 */}
          <div className="relative">
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {glossaryTerm.abbreviation}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {glossaryTerm.korean}
              </span>
            </div>

            {/* 설명 (축약) */}
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
              {glossaryTerm.description}
            </p>

            {/* 자세히 보기 링크 */}
            <Link
              href={`/glossary?search=${glossaryTerm.abbreviation}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              자세히 보기
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </span>
  );
}
