'use client';

import { useCallback } from 'react';
import { GlossaryTerm } from '@/types';
import { getGlossaryTermByAbbreviation } from '@/constants';

/**
 * 인터랙티브 용어 컴포넌트
 *
 * 이벤트 제목/설명에서 용어를 감지하고,
 * hover/tap 시 부모 컴포넌트에 선택된 용어를 알림
 */
interface InteractiveTermProps {
  term: string;
  children: React.ReactNode;
  onTermSelect: (term: GlossaryTerm | null) => void;
  isMobile?: boolean;
}

export function InteractiveTerm({
  term,
  children,
  onTermSelect,
  isMobile = false,
}: InteractiveTermProps) {
  const glossaryTerm = getGlossaryTermByAbbreviation(term);

  // 용어가 없으면 일반 텍스트로 표시
  if (!glossaryTerm) {
    return <span>{children}</span>;
  }

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      onTermSelect(glossaryTerm);
    }
  }, [glossaryTerm, isMobile, onTermSelect]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      onTermSelect(null);
    }
  }, [isMobile, onTermSelect]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      onTermSelect(glossaryTerm);
    }
  }, [glossaryTerm, isMobile, onTermSelect]);

  return (
    <span
      className="border-b border-dashed border-blue-400 dark:border-blue-500 cursor-help text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <svg className="w-3 h-3 opacity-60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

/**
 * 텍스트에서 용어를 찾아 InteractiveTerm으로 감싸는 헬퍼 함수
 */
export function parseTextWithInteractiveTerms(
  text: string,
  onTermSelect: (term: GlossaryTerm | null) => void,
  isMobile = false,
  glossaryTerms: GlossaryTerm[]
): React.ReactNode {
  // 모든 용어의 약어를 추출 (길이 순으로 정렬하여 긴 것부터 매칭)
  const abbreviations = glossaryTerms
    .map((term) => term.abbreviation)
    .sort((a, b) => b.length - a.length);

  // 용어가 없으면 원본 텍스트 반환
  if (abbreviations.length === 0) {
    return text;
  }

  // 정규식 패턴 생성 (단어 경계 사용)
  const pattern = new RegExp(`\\b(${abbreviations.join('|')})\\b`, 'g');

  // 텍스트를 분할하여 용어를 찾음
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // 매칭 전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // 매칭된 용어를 InteractiveTerm으로 감쌈
    const termAbbr = match[1];
    parts.push(
      <InteractiveTerm
        key={`${termAbbr}-${match.index}`}
        term={termAbbr}
        onTermSelect={onTermSelect}
        isMobile={isMobile}
      >
        {termAbbr}
      </InteractiveTerm>
    );

    lastIndex = pattern.lastIndex;
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * 이벤트 텍스트에서 용어사전 용어가 있는지 확인
 */
export function hasGlossaryTerms(text: string, glossaryTerms: GlossaryTerm[]): boolean {
  const abbreviations = glossaryTerms.map((term) => term.abbreviation);
  const pattern = new RegExp(`\\b(${abbreviations.join('|')})\\b`, 'g');
  return pattern.test(text);
}

/**
 * 이벤트에서 용어사전 용어 목록 추출
 */
export function extractGlossaryTerms(text: string, glossaryTerms: GlossaryTerm[]): GlossaryTerm[] {
  const abbreviations = glossaryTerms.map((term) => term.abbreviation);
  const pattern = new RegExp(`\\b(${abbreviations.join('|')})\\b`, 'g');
  const matches = text.match(pattern) || [];
  const uniqueMatches = [...new Set(matches)];

  return uniqueMatches
    .map((abbr) => glossaryTerms.find((t) => t.abbreviation === abbr))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
