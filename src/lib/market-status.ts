/**
 * 시장 상태 감지 유틸리티
 *
 * @description
 * 미국/한국 주식 시장의 개장/휴장 상태를 판단합니다.
 * 거래 시간, 주말, 공휴일을 고려하여 현재 시장 상태를 반환합니다.
 *
 * @note
 * - 미국 시장: NYSE/NASDAQ 기준 (ET 기준 09:30-16:00)
 * - 한국 시장: KRX 기준 (KST 기준 09:00-15:30)
 * - 공휴일은 정기적으로 업데이트 필요
 */

/**
 * 시장 상태 타입
 */
export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';

/**
 * 시장 상태 정보
 */
export interface MarketStatusInfo {
  /** 시장 상태 */
  status: MarketStatus;
  /** 상태 라벨 (한국어) */
  label: string;
  /** 설명 메시지 */
  message: string;
  /** 마지막 거래일 (YYYY-MM-DD) */
  lastTradingDate: string;
  /** 시장 개장 여부 */
  isOpen: boolean;
}

/**
 * 2024-2025 미국 주식시장 휴장일 (NYSE/NASDAQ)
 *
 * @note
 * - 새해 첫날(1/1), 마틴 루터 킹 주니어 데이(1월 셋째 월), 대통령의 날(2월 셋째 월)
 * - 성금요일(부활절 전 금요일), 메모리얼 데이(5월 마지막 월)
 * - 독립기념일(7/4), 노동절(9월 첫째 월), 추수감사절(11월 넷째 목)
 * - 크리스마스(12/25)
 *
 * 조기 폐장일 (1pm ET): 독립기념일 전날, 추수감사절 다음날, 크리스마스 이브
 */
const US_HOLIDAYS_2024 = [
  '2024-01-01', // 새해
  '2024-01-15', // 마틴 루터 킹 주니어 데이
  '2024-02-19', // 대통령의 날
  '2024-03-29', // 성금요일
  '2024-05-27', // 메모리얼 데이
  '2024-06-19', // 준틴스 독립기념일
  '2024-07-04', // 독립기념일
  '2024-09-02', // 노동절
  '2024-11-28', // 추수감사절
  '2024-12-25', // 크리스마스
];

const US_HOLIDAYS_2025 = [
  '2025-01-01', // 새해
  '2025-01-09', // 지미 카터 전 대통령 추모일 (특별 휴장)
  '2025-01-20', // 마틴 루터 킹 주니어 데이
  '2025-02-17', // 대통령의 날
  '2025-04-18', // 성금요일
  '2025-05-26', // 메모리얼 데이
  '2025-06-19', // 준틴스
  '2025-07-04', // 독립기념일
  '2025-09-01', // 노동절
  '2025-11-27', // 추수감사절
  '2025-12-25', // 크리스마스
];

/**
 * 미국 시장 조기 폐장일 (1pm ET 폐장)
 */
const US_EARLY_CLOSE_2024 = [
  '2024-07-03', // 독립기념일 전날
  '2024-11-29', // 추수감사절 다음날 (블랙프라이데이)
  '2024-12-24', // 크리스마스 이브
];

const US_EARLY_CLOSE_2025 = [
  '2025-07-03', // 독립기념일 전날
  '2025-11-28', // 추수감사절 다음날
  '2025-12-24', // 크리스마스 이브
];

/**
 * 한국 주식시장 휴장일 (KRX)
 */
const KR_HOLIDAYS_2024 = [
  '2024-01-01', // 새해
  '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', // 설날
  '2024-03-01', // 삼일절
  '2024-04-10', // 국회의원선거
  '2024-05-01', // 근로자의 날
  '2024-05-06', // 어린이날 대체휴일
  '2024-05-15', // 부처님오신날
  '2024-06-06', // 현충일
  '2024-08-15', // 광복절
  '2024-09-16', '2024-09-17', '2024-09-18', // 추석
  '2024-10-03', // 개천절
  '2024-10-09', // 한글날
  '2024-12-25', // 크리스마스
  '2024-12-31', // 연말 휴장
];

const KR_HOLIDAYS_2025 = [
  '2025-01-01', // 새해
  '2025-01-28', '2025-01-29', '2025-01-30', // 설날
  '2025-03-01', // 삼일절
  '2025-05-01', // 근로자의 날
  '2025-05-05', // 어린이날
  '2025-05-06', // 부처님오신날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-03', // 개천절
  '2025-10-06', '2025-10-07', '2025-10-08', // 추석
  '2025-10-09', // 한글날
  '2025-12-25', // 크리스마스
];

/**
 * 주어진 날짜가 주말인지 확인
 *
 * @param date - 확인할 날짜
 * @returns 주말 여부 (토요일=6, 일요일=0)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * 날짜를 YYYY-MM-DD 형식 문자열로 변환
 *
 * @param date - 변환할 날짜
 * @returns YYYY-MM-DD 형식 문자열
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 미국 동부 시간(ET) 기준 현재 시간 반환
 *
 * @returns 미국 동부 시간 Date 객체
 */
function getUSEasternTime(): Date {
  // 한국 시간을 미국 동부 시간으로 변환
  // KST = UTC+9, ET = UTC-5 (EST) 또는 UTC-4 (EDT)
  // 차이: 13~14시간
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // 미국 동부 표준시 (EST = UTC-5)
  // 서머타임 기간 (3월 둘째 일요일 ~ 11월 첫째 일요일): EDT = UTC-4
  const etOffset = isDaylightSavingTime(now) ? -4 : -5;
  return new Date(utc + etOffset * 3600000);
}

/**
 * 서머타임(DST) 여부 확인 (미국 기준)
 *
 * @param date - 확인할 날짜
 * @returns 서머타임 적용 여부
 */
function isDaylightSavingTime(date: Date): boolean {
  const year = date.getFullYear();

  // 3월 둘째 일요일 계산
  const marchFirst = new Date(year, 2, 1);
  const daysUntilSunday = (7 - marchFirst.getDay()) % 7;
  const secondSunday = 8 + daysUntilSunday;
  const dstStart = new Date(year, 2, secondSunday, 2, 0, 0);

  // 11월 첫째 일요일 계산
  const novFirst = new Date(year, 10, 1);
  const daysUntilNovSunday = (7 - novFirst.getDay()) % 7;
  const firstSunday = 1 + daysUntilNovSunday;
  const dstEnd = new Date(year, 10, firstSunday, 2, 0, 0);

  return date >= dstStart && date < dstEnd;
}

/**
 * 마지막 거래일 계산 (주말/휴일 제외)
 *
 * @param market - 시장 코드 ('us' | 'kr')
 * @param baseDate - 기준 날짜 (기본값: 오늘)
 * @returns 마지막 거래일 (YYYY-MM-DD)
 */
export function getLastTradingDate(market: 'us' | 'kr', baseDate?: Date): string {
  const holidays =
    market === 'us'
      ? [...US_HOLIDAYS_2024, ...US_HOLIDAYS_2025]
      : [...KR_HOLIDAYS_2024, ...KR_HOLIDAYS_2025];

  // 기준 날짜 설정 (미국 시장은 ET 기준)
  let date = baseDate ? new Date(baseDate) : (market === 'us' ? getUSEasternTime() : new Date());

  // 현재 시간이 시장 개장 전이면 전날을 기준으로 함
  if (market === 'us') {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // 미국 시장 개장 시간 (9:30 AM ET) 전이면 전날
    if (hours < 9 || (hours === 9 && minutes < 30)) {
      date.setDate(date.getDate() - 1);
    }
  } else {
    const hours = date.getHours();
    // 한국 시장 개장 시간 (9:00 AM KST) 전이면 전날
    if (hours < 9) {
      date.setDate(date.getDate() - 1);
    }
  }

  // 주말/휴일이면 이전 거래일로 이동
  let dateStr = formatDate(date);
  while (isWeekend(date) || holidays.includes(dateStr)) {
    date.setDate(date.getDate() - 1);
    dateStr = formatDate(date);
  }

  return dateStr;
}

/**
 * 미국 시장 상태 확인
 *
 * @returns 미국 시장 상태 정보
 *
 * @description
 * 미국 주식시장 거래 시간 (ET 기준):
 * - 프리마켓: 04:00 - 09:30
 * - 정규장: 09:30 - 16:00
 * - 애프터마켓: 16:00 - 20:00
 * - 조기 폐장일: 09:30 - 13:00
 */
export function getUSMarketStatus(): MarketStatusInfo {
  const etNow = getUSEasternTime();
  const dateStr = formatDate(etNow);
  const hours = etNow.getHours();
  const minutes = etNow.getMinutes();
  const time = hours * 60 + minutes; // 분 단위로 변환

  const allHolidays = [...US_HOLIDAYS_2024, ...US_HOLIDAYS_2025];
  const earlyClose = [...US_EARLY_CLOSE_2024, ...US_EARLY_CLOSE_2025];
  const lastTradingDate = getLastTradingDate('us');

  // 주말 체크
  if (isWeekend(etNow)) {
    return {
      status: 'closed',
      label: '휴장',
      message: `주말 휴장 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  }

  // 공휴일 체크
  if (allHolidays.includes(dateStr)) {
    return {
      status: 'closed',
      label: '휴장',
      message: `휴일 휴장 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  }

  // 조기 폐장일 체크 (13:00 이후 폐장)
  const closeTime = earlyClose.includes(dateStr) ? 13 * 60 : 16 * 60; // 분 단위

  // 시간대별 상태
  if (time < 4 * 60) {
    // 04:00 이전: 휴장 (야간)
    return {
      status: 'closed',
      label: '휴장',
      message: `미국 시장 휴장 중 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  } else if (time < 9 * 60 + 30) {
    // 04:00 - 09:30: 프리마켓
    return {
      status: 'pre-market',
      label: '프리마켓',
      message: '프리마켓 진행 중 (정규장 09:30 개장)',
      lastTradingDate,
      isOpen: false,
    };
  } else if (time < closeTime) {
    // 09:30 - 16:00 (또는 13:00): 정규장
    return {
      status: 'open',
      label: '개장',
      message: earlyClose.includes(dateStr) ? '조기 폐장 (13:00 ET 폐장)' : '정규장 진행 중',
      lastTradingDate: dateStr,
      isOpen: true,
    };
  } else if (time < 20 * 60) {
    // 16:00 - 20:00: 애프터마켓
    return {
      status: 'after-hours',
      label: '애프터마켓',
      message: '애프터마켓 진행 중',
      lastTradingDate: dateStr,
      isOpen: false,
    };
  } else {
    // 20:00 이후: 휴장
    return {
      status: 'closed',
      label: '휴장',
      message: `미국 시장 휴장 중 (${dateStr} 종가 기준)`,
      lastTradingDate: dateStr,
      isOpen: false,
    };
  }
}

/**
 * 한국 시장 상태 확인
 *
 * @returns 한국 시장 상태 정보
 *
 * @description
 * 한국 주식시장 거래 시간 (KST 기준):
 * - 정규장: 09:00 - 15:30
 * - 시간외 종가: 15:40 - 16:00
 * - 시간외 단일가: 16:00 - 18:00
 */
export function getKRMarketStatus(): MarketStatusInfo {
  const now = new Date();
  const dateStr = formatDate(now);
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;

  const allHolidays = [...KR_HOLIDAYS_2024, ...KR_HOLIDAYS_2025];
  const lastTradingDate = getLastTradingDate('kr');

  // 주말 체크
  if (isWeekend(now)) {
    return {
      status: 'closed',
      label: '휴장',
      message: `주말 휴장 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  }

  // 공휴일 체크
  if (allHolidays.includes(dateStr)) {
    return {
      status: 'closed',
      label: '휴장',
      message: `휴일 휴장 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  }

  // 시간대별 상태
  if (time < 9 * 60) {
    // 09:00 이전: 휴장
    return {
      status: 'closed',
      label: '장 시작 전',
      message: `한국 시장 개장 대기 (${lastTradingDate} 종가 기준)`,
      lastTradingDate,
      isOpen: false,
    };
  } else if (time < 15 * 60 + 30) {
    // 09:00 - 15:30: 정규장
    return {
      status: 'open',
      label: '개장',
      message: '정규장 진행 중',
      lastTradingDate: dateStr,
      isOpen: true,
    };
  } else if (time < 18 * 60) {
    // 15:30 - 18:00: 시간외
    return {
      status: 'after-hours',
      label: '시간외',
      message: '시간외 거래 진행 중',
      lastTradingDate: dateStr,
      isOpen: false,
    };
  } else {
    // 18:00 이후: 휴장
    return {
      status: 'closed',
      label: '휴장',
      message: `한국 시장 휴장 중 (${dateStr} 종가 기준)`,
      lastTradingDate: dateStr,
      isOpen: false,
    };
  }
}

/**
 * 시장 상태에 따른 색상 반환 (Tailwind CSS 클래스)
 *
 * @param status - 시장 상태
 * @returns Tailwind CSS 색상 클래스
 */
export function getMarketStatusColor(status: MarketStatus): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'open':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        dot: 'bg-green-500',
      };
    case 'pre-market':
    case 'after-hours':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        dot: 'bg-yellow-500',
      };
    case 'closed':
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-400',
      };
  }
}
