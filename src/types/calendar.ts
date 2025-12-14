export type EventCategory = 'institution' | 'earnings' | 'corporate' | 'crypto';
export type EventImportance = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  id: string;
  date: string; // "2024-04-19"
  title: string;
  category: EventCategory;
  countryCode?: string; // 국기 표시용 (institution)
  companyDomain?: string; // 기업 로고용 (earnings, corporate, crypto)
  importance: EventImportance;
  time?: string; // 한국 시간 "04:00"
  description?: string;
}

export interface EventCategoryFilter {
  id: EventCategory | 'all';
  label: string;
  emoji: string;
}
