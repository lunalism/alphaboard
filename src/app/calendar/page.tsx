'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Sidebar, BottomNav } from '@/components/layout';
import { calendarEvents, eventCategoryFilters } from '@/constants';
import { EventCategory, CalendarEvent } from '@/types';

export default function CalendarPage() {
  const [activeMenu, setActiveMenu] = useState('calendar');
  const [activeFilter, setActiveFilter] = useState<EventCategory | 'all'>('all');

  // 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return calendarEvents;
    return calendarEvents.filter(event => event.category === activeFilter);
  }, [activeFilter]);

  // 월별로 그룹화
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(event => {
      const month = event.date.substring(0, 7); // "2024-01"
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(event);
    });
    // 날짜순 정렬
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => a.date.localeCompare(b.date));
    });
    return grouped;
  }, [filteredEvents]);

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return `${year}년 ${parseInt(m)}월`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return { day, weekday };
  };

  const getCategoryEmoji = (category: EventCategory) => {
    switch (category) {
      case 'institution': return '🏛️';
      case 'earnings': return '📊';
      case 'corporate': return '🎉';
      case 'crypto': return '🪙';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sidebar - hidden on mobile */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Bottom Navigation - visible only on mobile */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">경제 캘린더</h1>
            <p className="text-gray-500 text-sm">주요 경제 이벤트 일정을 확인하세요</p>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {eventCategoryFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Events by Month */}
          <div className="space-y-8">
            {Object.entries(eventsByMonth)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, events]) => (
              <section key={month}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{formatMonth(month)}</h2>
                <div className="space-y-3">
                  {events.map(event => {
                    const { day, weekday } = formatDate(event.date);
                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Date */}
                          <div className="flex-shrink-0 w-14 text-center">
                            <div className="text-2xl font-bold text-gray-900">{day}</div>
                            <div className="text-xs text-gray-500">{weekday}요일</div>
                          </div>

                          {/* Icon/Logo */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {event.countryCode ? (
                              <Image
                                src={`https://hatscripts.github.io/circle-flags/flags/${event.countryCode}.svg`}
                                alt={event.countryCode}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-cover"
                                unoptimized
                              />
                            ) : event.companyDomain ? (
                              <EventLogo domain={event.companyDomain} />
                            ) : (
                              <span className="text-xl">{getCategoryEmoji(event.category)}</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImportanceColor(event.importance)}`}>
                                {event.importance === 'high' ? '중요' : event.importance === 'medium' ? '보통' : '낮음'}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-500 truncate">{event.description}</p>
                            )}
                            {event.time && (
                              <p className="text-xs text-gray-400 mt-1">🕐 {event.time} (한국시간)</p>
                            )}
                          </div>

                          {/* Category Badge */}
                          <div className="flex-shrink-0">
                            <span className="text-lg">{getCategoryEmoji(event.category)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">이벤트가 없습니다</h2>
              <p className="text-gray-500 text-sm">선택한 카테고리에 해당하는 이벤트가 없습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Event Logo Component
function EventLogo({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
  const logoUrl = clientId
    ? `https://cdn.brandfetch.io/${domain}/symbol?c=${clientId}`
    : `https://cdn.brandfetch.io/${domain}/symbol`;

  if (error) {
    return <span className="text-xl">📊</span>;
  }

  return (
    <Image
      src={logoUrl}
      alt={domain}
      width={40}
      height={40}
      className="w-10 h-10 object-contain"
      unoptimized
      onError={() => setError(true)}
    />
  );
}
