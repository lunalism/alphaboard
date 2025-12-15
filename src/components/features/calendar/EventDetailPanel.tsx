'use client';

import { CalendarEvent, EventCategory } from '@/types';
import { CompanyLogo, FlagLogo, GlossaryTooltip } from '@/components/common';
import { glossaryTerms } from '@/constants';

/**
 * 텍스트에서 용어사전 용어를 찾아 툴팁으로 감싸는 헬퍼 함수
 *
 * @param text - 원본 텍스트
 * @returns 용어가 GlossaryTooltip으로 감싸진 React 노드 배열
 */
function parseTextWithGlossary(text: string): React.ReactNode {
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

    // 매칭된 용어를 툴팁으로 감쌈
    const term = match[1];
    parts.push(
      <GlossaryTooltip key={`${term}-${match.index}`} term={term}>
        {term}
      </GlossaryTooltip>
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
 * 이벤트 상세 패널 컴포넌트 (데스크톱 오른쪽 사이드바용)
 *
 * Props:
 * - selectedDate: 선택된 날짜
 * - events: 해당 날짜의 이벤트 목록
 *
 * 기능:
 * - 용어사전 연동: 알려진 용어에 툴팁 표시
 */
interface EventDetailPanelProps {
  selectedDate: string | null;
  events: CalendarEvent[];
}

export function EventDetailPanel({ selectedDate, events }: EventDetailPanelProps) {
  // 카테고리 이모지
  const getCategoryEmoji = (category: EventCategory) => {
    switch (category) {
      case 'institution':
        return '🏛️';
      case 'earnings':
        return '📊';
      case 'corporate':
        return '🎉';
      case 'crypto':
        return '🪙';
    }
  };

  // 중요도 색상
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // 날짜 포맷팅
  const formatSelectedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  // 날짜가 선택되지 않은 경우
  if (!selectedDate) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 h-full flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          날짜를 선택하세요
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          캘린더에서 날짜를 클릭하면
          <br />
          해당 날짜의 이벤트를 확인할 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 h-full overflow-y-auto">
      {/* 선택된 날짜 헤더 */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {formatSelectedDate(selectedDate)}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {events.length > 0 ? `${events.length}개의 이벤트` : '이벤트 없음'}
        </p>
      </div>

      {/* 이벤트 목록 */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* 로고/국기 */}
              {event.countryCode ? (
                <FlagLogo countryCode={event.countryCode} size="md" />
              ) : event.companyDomain ? (
                <CompanyLogo domain={event.companyDomain} size="md" />
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xl">{getCategoryEmoji(event.category)}</span>
                </div>
              )}

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                {/* 이벤트 제목 (용어사전 툴팁 적용) */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                    {parseTextWithGlossary(event.title)}
                  </h4>
                  <span className="text-lg flex-shrink-0">{getCategoryEmoji(event.category)}</span>
                </div>

                {/* 중요도 뱃지 */}
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getImportanceColor(
                    event.importance
                  )}`}
                >
                  {event.importance === 'high'
                    ? '중요'
                    : event.importance === 'medium'
                    ? '보통'
                    : '낮음'}
                </span>

                {/* 설명 (용어사전 툴팁 적용) */}
                {event.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {parseTextWithGlossary(event.description)}
                  </p>
                )}

                {/* 시간 */}
                {event.time && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    🕐 {event.time} (한국시간)
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 이벤트 없음 */}
        {events.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              이 날짜에 예정된 이벤트가 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
