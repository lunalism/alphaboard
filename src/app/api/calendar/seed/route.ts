/**
 * 캘린더 이벤트 시드 API
 *
 * @route POST /api/calendar/seed
 *
 * @description
 * 2026년 경제 캘린더 이벤트를 Firestore에 초기화합니다.
 * 관리자만 실행 가능 (Firebase Auth 확인)
 *
 * 포함 이벤트:
 * - FOMC 회의 (8회/년)
 * - 미국 CPI 발표 (12회/년)
 * - 미국 GDP 발표 (4회/년)
 * - 한국은행 금융통화위원회 (8회/년)
 * - 한국 CPI 발표 (12회/년)
 * - 미국 고용보고서 (12회/년)
 *
 * @example
 * POST /api/calendar/seed
 * Authorization: Bearer <admin-token>
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calendarEventsCollection,
  createDocument,
  queryCollection,
  serverTimestamp,
} from '@/lib/firestore';
import { calendarEvents as staticEvents } from '@/constants/calendar';

// ==================== 2026년 경제 이벤트 데이터 ====================

/**
 * FOMC 회의 일정 2026년
 * * 표시: SEP(경제전망요약) 발표 포함
 *
 * 발표 시간: 회의 둘째날 오후 2시 (동부) = 한국 시간 새벽 4시 (다음날)
 */
const fomcMeetings2026 = [
  {
    date: '2026-01-28',
    endDate: undefined, // 1월 27-28일
    description: '2026년 첫 FOMC 정례회의',
    hasSEP: false,
  },
  {
    date: '2026-03-18',
    endDate: undefined, // 3월 17-18일
    description: '3월 FOMC 회의 + 경제전망(SEP) 발표',
    hasSEP: true,
  },
  {
    date: '2026-05-06',
    endDate: undefined, // 5월 5-6일
    description: '5월 FOMC 정례회의',
    hasSEP: false,
  },
  {
    date: '2026-06-17',
    endDate: undefined, // 6월 16-17일
    description: '6월 FOMC 회의 + 경제전망(SEP) 발표',
    hasSEP: true,
  },
  {
    date: '2026-07-29',
    endDate: undefined, // 7월 28-29일
    description: '7월 FOMC 정례회의',
    hasSEP: false,
  },
  {
    date: '2026-09-16',
    endDate: undefined, // 9월 15-16일
    description: '9월 FOMC 회의 + 경제전망(SEP) 발표',
    hasSEP: true,
  },
  {
    date: '2026-10-28',
    endDate: undefined, // 10월 27-28일
    description: '10월 FOMC 정례회의',
    hasSEP: false,
  },
  {
    date: '2026-12-09',
    endDate: undefined, // 12월 8-9일
    description: '12월 FOMC 회의 + 경제전망(SEP) 발표',
    hasSEP: true,
  },
];

/**
 * 미국 CPI(소비자물가지수) 발표 일정 2026년
 * 발표 시간: 오전 8:30 (동부) = 한국 시간 22:30 (전날)
 */
const usCPI2026 = [
  { date: '2026-01-13', dataMonth: '12월', description: '2025년 12월 소비자물가지수' },
  { date: '2026-02-11', dataMonth: '1월', description: '2026년 1월 소비자물가지수' },
  { date: '2026-03-11', dataMonth: '2월', description: '2026년 2월 소비자물가지수' },
  { date: '2026-04-14', dataMonth: '3월', description: '2026년 3월 소비자물가지수' },
  { date: '2026-05-12', dataMonth: '4월', description: '2026년 4월 소비자물가지수' },
  { date: '2026-06-10', dataMonth: '5월', description: '2026년 5월 소비자물가지수' },
  { date: '2026-07-15', dataMonth: '6월', description: '2026년 6월 소비자물가지수' },
  { date: '2026-08-12', dataMonth: '7월', description: '2026년 7월 소비자물가지수' },
  { date: '2026-09-10', dataMonth: '8월', description: '2026년 8월 소비자물가지수' },
  { date: '2026-10-13', dataMonth: '9월', description: '2026년 9월 소비자물가지수' },
  { date: '2026-11-12', dataMonth: '10월', description: '2026년 10월 소비자물가지수' },
  { date: '2026-12-10', dataMonth: '11월', description: '2026년 11월 소비자물가지수' },
];

/**
 * 미국 고용보고서 발표 일정 2026년
 * 매월 첫째 주 금요일
 * 발표 시간: 오전 8:30 (동부) = 한국 시간 22:30 (전날)
 */
const usEmployment2026 = [
  { date: '2026-01-09', dataMonth: '12월', description: '2025년 12월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-02-06', dataMonth: '1월', description: '2026년 1월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-03-06', dataMonth: '2월', description: '2026년 2월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-04-03', dataMonth: '3월', description: '2026년 3월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-05-08', dataMonth: '4월', description: '2026년 4월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-06-05', dataMonth: '5월', description: '2026년 5월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-07-03', dataMonth: '6월', description: '2026년 6월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-08-07', dataMonth: '7월', description: '2026년 7월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-09-04', dataMonth: '8월', description: '2026년 8월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-10-02', dataMonth: '9월', description: '2026년 9월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-11-06', dataMonth: '10월', description: '2026년 10월 고용보고서 (비농업 고용, 실업률)' },
  { date: '2026-12-04', dataMonth: '11월', description: '2026년 11월 고용보고서 (비농업 고용, 실업률)' },
];

/**
 * 미국 GDP 발표 일정 2026년
 * 분기별 (속보 → 수정 → 확정)
 * 발표 시간: 오전 8:30 (동부) = 한국 시간 22:30 (전날)
 */
const usGDP2026 = [
  { date: '2026-01-29', quarter: '4분기', type: '속보', description: '2025년 4분기 GDP 속보치' },
  { date: '2026-02-26', quarter: '4분기', type: '수정', description: '2025년 4분기 GDP 수정치' },
  { date: '2026-03-26', quarter: '4분기', type: '확정', description: '2025년 4분기 GDP 확정치' },
  { date: '2026-04-29', quarter: '1분기', type: '속보', description: '2026년 1분기 GDP 속보치' },
  { date: '2026-05-28', quarter: '1분기', type: '수정', description: '2026년 1분기 GDP 수정치' },
  { date: '2026-06-25', quarter: '1분기', type: '확정', description: '2026년 1분기 GDP 확정치' },
  { date: '2026-07-30', quarter: '2분기', type: '속보', description: '2026년 2분기 GDP 속보치' },
  { date: '2026-08-27', quarter: '2분기', type: '수정', description: '2026년 2분기 GDP 수정치' },
  { date: '2026-09-24', quarter: '2분기', type: '확정', description: '2026년 2분기 GDP 확정치' },
  { date: '2026-10-29', quarter: '3분기', type: '속보', description: '2026년 3분기 GDP 속보치' },
  { date: '2026-11-25', quarter: '3분기', type: '수정', description: '2026년 3분기 GDP 수정치' },
  { date: '2026-12-23', quarter: '3분기', type: '확정', description: '2026년 3분기 GDP 확정치' },
];

/**
 * 한국은행 금융통화위원회 일정 2026년
 * 기준금리 결정 (연 8회)
 * 발표 시간: 오전 10:00 (한국시간)
 */
const bokMeetings2026 = [
  { date: '2026-01-15', description: '2026년 1월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-02-27', description: '2026년 2월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-04-09', description: '2026년 4월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-05-28', description: '2026년 5월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-07-09', description: '2026년 7월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-08-27', description: '2026년 8월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-10-15', description: '2026년 10월 금융통화위원회 (기준금리 결정)' },
  { date: '2026-11-26', description: '2026년 11월 금융통화위원회 (기준금리 결정)' },
];

/**
 * 한국 CPI 발표 일정 2026년
 * 매월 초 (통계청 발표)
 * 발표 시간: 오전 8:00 (한국시간)
 */
const krCPI2026 = [
  { date: '2026-01-02', dataMonth: '12월', description: '2025년 12월 소비자물가지수' },
  { date: '2026-02-03', dataMonth: '1월', description: '2026년 1월 소비자물가지수' },
  { date: '2026-03-03', dataMonth: '2월', description: '2026년 2월 소비자물가지수' },
  { date: '2026-04-02', dataMonth: '3월', description: '2026년 3월 소비자물가지수' },
  { date: '2026-05-04', dataMonth: '4월', description: '2026년 4월 소비자물가지수' },
  { date: '2026-06-02', dataMonth: '5월', description: '2026년 5월 소비자물가지수' },
  { date: '2026-07-02', dataMonth: '6월', description: '2026년 6월 소비자물가지수' },
  { date: '2026-08-04', dataMonth: '7월', description: '2026년 7월 소비자물가지수' },
  { date: '2026-09-01', dataMonth: '8월', description: '2026년 8월 소비자물가지수' },
  { date: '2026-10-06', dataMonth: '9월', description: '2026년 9월 소비자물가지수' },
  { date: '2026-11-03', dataMonth: '10월', description: '2026년 10월 소비자물가지수' },
  { date: '2026-12-01', dataMonth: '11월', description: '2026년 11월 소비자물가지수' },
];

/**
 * 한국 주요 공휴일/휴장일 2026년
 */
const krHolidays2026 = [
  { date: '2026-01-01', title: '신정', description: '증시 휴장' },
  { date: '2026-02-16', title: '설날 연휴', description: '증시 휴장 (2/16-18)' },
  { date: '2026-02-17', title: '설날', description: '증시 휴장' },
  { date: '2026-02-18', title: '설날 연휴', description: '증시 휴장' },
  { date: '2026-03-01', title: '삼일절', description: '증시 휴장' },
  { date: '2026-05-05', title: '어린이날', description: '증시 휴장' },
  { date: '2026-05-24', title: '부처님오신날', description: '증시 휴장' },
  { date: '2026-06-06', title: '현충일', description: '증시 휴장' },
  { date: '2026-08-15', title: '광복절', description: '증시 휴장' },
  { date: '2026-09-24', title: '추석 연휴', description: '증시 휴장 (9/24-26)' },
  { date: '2026-09-25', title: '추석', description: '증시 휴장' },
  { date: '2026-09-26', title: '추석 연휴', description: '증시 휴장' },
  { date: '2026-10-03', title: '개천절', description: '증시 휴장' },
  { date: '2026-10-09', title: '한글날', description: '증시 휴장' },
  { date: '2026-12-25', title: '성탄절', description: '증시 휴장' },
];

/**
 * 미국 주요 공휴일/휴장일 2026년
 */
const usHolidays2026 = [
  { date: '2026-01-01', title: "New Year's Day", description: '미국 증시 휴장' },
  { date: '2026-01-19', title: 'MLK Day', description: '마틴 루터 킹 기념일, 미국 증시 휴장' },
  { date: '2026-02-16', title: "Presidents' Day", description: '대통령의 날, 미국 증시 휴장' },
  { date: '2026-04-03', title: 'Good Friday', description: '성금요일, 미국 증시 휴장' },
  { date: '2026-05-25', title: 'Memorial Day', description: '현충일, 미국 증시 휴장' },
  { date: '2026-06-19', title: 'Juneteenth', description: '준틴스 기념일, 미국 증시 휴장' },
  { date: '2026-07-03', title: 'Independence Day (observed)', description: '독립기념일 대체휴일, 미국 증시 휴장' },
  { date: '2026-09-07', title: 'Labor Day', description: '노동절, 미국 증시 휴장' },
  { date: '2026-11-26', title: 'Thanksgiving Day', description: '추수감사절, 미국 증시 휴장' },
  { date: '2026-12-25', title: 'Christmas Day', description: '크리스마스, 미국 증시 휴장' },
];

// ==================== 이벤트 데이터 생성 함수 ====================

interface SeedEvent {
  title: string;
  titleEn?: string;
  date: string;
  endDate?: string;
  category: 'institution' | 'earnings' | 'corporate' | 'crypto';
  countryCode?: string;
  importance: 'high' | 'medium' | 'low';
  time?: string;
  description?: string;
  relatedTerms?: string[];
}

/**
 * 2026년 이벤트 데이터 생성
 */
function generate2026Events(): SeedEvent[] {
  const events: SeedEvent[] = [];

  // FOMC 회의
  fomcMeetings2026.forEach((meeting) => {
    events.push({
      title: meeting.hasSEP ? 'FOMC 회의 + 경제전망(SEP)' : 'FOMC 정례회의',
      titleEn: meeting.hasSEP ? 'FOMC Meeting + SEP' : 'FOMC Meeting',
      date: meeting.date,
      category: 'institution',
      countryCode: 'us',
      importance: 'high',
      time: '04:00', // 한국 시간 새벽 4시 (다음날)
      description: meeting.description,
      relatedTerms: ['FOMC', '기준금리', '연준', 'SEP'],
    });
  });

  // 미국 CPI
  usCPI2026.forEach((cpi) => {
    events.push({
      title: `미국 CPI 발표 (${cpi.dataMonth})`,
      titleEn: `US CPI (${cpi.dataMonth} data)`,
      date: cpi.date,
      category: 'institution',
      countryCode: 'us',
      importance: 'high',
      time: '22:30', // 한국 시간 22:30 (전날)
      description: cpi.description,
      relatedTerms: ['CPI', '소비자물가지수', '인플레이션'],
    });
  });

  // 미국 고용보고서
  usEmployment2026.forEach((emp) => {
    events.push({
      title: `미국 고용보고서 (${emp.dataMonth})`,
      titleEn: `US Employment Report (${emp.dataMonth} data)`,
      date: emp.date,
      category: 'institution',
      countryCode: 'us',
      importance: 'high',
      time: '22:30',
      description: emp.description,
      relatedTerms: ['비농업 고용', '실업률', '고용지표'],
    });
  });

  // 미국 GDP
  usGDP2026.forEach((gdp) => {
    events.push({
      title: `미국 GDP ${gdp.type} (${gdp.quarter})`,
      titleEn: `US GDP ${gdp.type === '속보' ? 'Advance' : gdp.type === '수정' ? 'Preliminary' : 'Final'} (Q${gdp.quarter.charAt(0)})`,
      date: gdp.date,
      category: 'institution',
      countryCode: 'us',
      importance: gdp.type === '속보' ? 'high' : 'medium',
      time: '22:30',
      description: gdp.description,
      relatedTerms: ['GDP', '경제성장률'],
    });
  });

  // 한국은행 금융통화위원회
  bokMeetings2026.forEach((meeting) => {
    events.push({
      title: '한국은행 금융통화위원회',
      titleEn: 'BOK Monetary Policy Meeting',
      date: meeting.date,
      category: 'institution',
      countryCode: 'kr',
      importance: 'high',
      time: '10:00',
      description: meeting.description,
      relatedTerms: ['한국은행', '기준금리', '금통위'],
    });
  });

  // 한국 CPI
  krCPI2026.forEach((cpi) => {
    events.push({
      title: `한국 CPI 발표 (${cpi.dataMonth})`,
      titleEn: `Korea CPI (${cpi.dataMonth} data)`,
      date: cpi.date,
      category: 'institution',
      countryCode: 'kr',
      importance: 'medium',
      time: '08:00',
      description: cpi.description,
      relatedTerms: ['CPI', '소비자물가지수', '물가'],
    });
  });

  // 한국 휴장일
  krHolidays2026.forEach((holiday) => {
    events.push({
      title: `한국 ${holiday.title}`,
      titleEn: holiday.title,
      date: holiday.date,
      category: 'corporate',
      countryCode: 'kr',
      importance: 'low',
      description: holiday.description,
    });
  });

  // 미국 휴장일
  usHolidays2026.forEach((holiday) => {
    events.push({
      title: `미국 ${holiday.title}`,
      titleEn: holiday.title,
      date: holiday.date,
      category: 'corporate',
      countryCode: 'us',
      importance: 'low',
      description: holiday.description,
    });
  });

  return events;
}

// ==================== API 핸들러 ====================

/**
 * POST /api/calendar/seed
 *
 * 캘린더 이벤트를 Firestore에 시드합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 옵션 파싱
    let options = { includeStatic: true, include2026: true };
    try {
      const body = await request.json();
      options = { ...options, ...body };
    } catch {
      // 빈 요청 본문 허용
    }

    const results = {
      staticEventsAdded: 0,
      events2026Added: 0,
      errors: [] as string[],
    };

    // 기존 정적 데이터 시드 (선택)
    if (options.includeStatic) {
      for (const event of staticEvents) {
        try {
          await createDocument(calendarEventsCollection(), {
            title: event.title,
            date: event.date,
            category: event.category,
            countryCode: event.countryCode,
            companyDomain: event.companyDomain,
            importance: event.importance,
            time: event.time,
            description: event.description,
          });
          results.staticEventsAdded++;
        } catch (error) {
          results.errors.push(`정적 이벤트 추가 실패: ${event.id}`);
        }
      }
    }

    // 2026년 이벤트 시드 (선택)
    if (options.include2026) {
      const events2026 = generate2026Events();

      for (const event of events2026) {
        try {
          await createDocument(calendarEventsCollection(), {
            title: event.title,
            titleEn: event.titleEn,
            date: event.date,
            endDate: event.endDate,
            category: event.category,
            countryCode: event.countryCode,
            importance: event.importance,
            time: event.time,
            description: event.description,
            relatedTerms: event.relatedTerms,
          });
          results.events2026Added++;
        } catch (error) {
          results.errors.push(`2026 이벤트 추가 실패: ${event.title} (${event.date})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '캘린더 이벤트 시드 완료',
      results: {
        staticEventsAdded: results.staticEventsAdded,
        events2026Added: results.events2026Added,
        totalAdded: results.staticEventsAdded + results.events2026Added,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
    });
  } catch (error) {
    console.error('[Calendar Seed API] 에러:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'SEED_ERROR',
        message: '캘린더 이벤트 시드 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/seed
 *
 * 현재 Firestore의 캘린더 이벤트 개수를 조회합니다.
 */
export async function GET() {
  try {
    const events = await queryCollection(calendarEventsCollection(), []);

    return NextResponse.json({
      success: true,
      count: events.length,
      message: `Firestore에 ${events.length}개의 캘린더 이벤트가 있습니다.`,
    });
  } catch (error) {
    console.error('[Calendar Seed API] 조회 에러:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'QUERY_ERROR',
        message: 'Firestore 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
