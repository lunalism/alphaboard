'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getGlossaryTermByAbbreviation } from '@/constants';

/**
 * 용어사전 툴팁 컴포넌트
 *
 * 기능:
 * - 데스크톱: hover로 툴팁 표시
 * - 모바일/태블릿: tap으로 툴팁 토글
 * - 외부 클릭 시 툴팁 닫힘
 * - 다크모드 지원
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
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 용어 데이터 조회
  const glossaryTerm = getGlossaryTermByAbbreviation(term);

  // 터치 디바이스 감지
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouchDevice();
  }, []);

  // 툴팁 위치 계산 (뷰포트 경계 체크)
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // 아래에 공간이 부족하면 위에 표시
      if (triggerRect.bottom + tooltipHeight + 20 > viewportHeight) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isVisible]);

  // 외부 클릭 시 툴팁 닫기
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    if (
      tooltipRef.current &&
      triggerRef.current &&
      !tooltipRef.current.contains(event.target as Node) &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, handleClickOutside]);

  // 용어가 없으면 일반 텍스트로 표시
  if (!glossaryTerm) {
    return <span>{children}</span>;
  }

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible((prev) => !prev);
  };

  // 클릭 이벤트 핸들러 (터치 디바이스에서 클릭 이벤트도 처리)
  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible((prev) => !prev);
    }
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline"
      onMouseEnter={() => !isTouchDevice && setIsVisible(true)}
      onMouseLeave={() => !isTouchDevice && setIsVisible(false)}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {/* 트리거 텍스트 (밑줄 + ⓘ 아이콘) */}
      <span className="border-b border-dashed border-blue-400 dark:border-blue-500 cursor-help text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5">
        {children}
        <svg
          className="w-3 h-3 opacity-60 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      {/* 툴팁 카드 */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-[100] w-[300px] p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 ${
            position === 'top'
              ? 'bottom-full mb-2 left-0'
              : 'top-full mt-2 left-0'
          }`}
          style={{
            // 화면 왼쪽/오른쪽 경계 체크
            transform: 'translateX(0)',
            maxWidth: 'calc(100vw - 32px)',
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* 툴팁 화살표 */}
          <div
            className={`absolute left-4 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rotate-45 ${
              position === 'top'
                ? 'bottom-[-6px] border-r border-b'
                : 'top-[-6px] border-l border-t'
            }`}
          />

          {/* 툴팁 내용 */}
          <div className="relative">
            {/* 헤더: 영문 약어 + 한글명 */}
            <div className="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {glossaryTerm.abbreviation}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {glossaryTerm.korean}
                </span>
              </div>
              {/* 영문 전체명 */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-normal break-words">
                {glossaryTerm.fullName}
              </p>
            </div>

            {/* 설명 (2-3줄) */}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-normal break-words line-clamp-3 mb-3">
              {glossaryTerm.description}
            </p>

            {/* 용어사전에서 보기 링크 */}
            <Link
              href={`/glossary?search=${glossaryTerm.abbreviation}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              용어사전에서 보기
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
