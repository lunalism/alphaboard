/**
 * 크롤링된 뉴스 타입 정의
 *
 * 네이버 금융 뉴스에서 크롤링한 뉴스 데이터의 타입을 정의합니다.
 * 기존 NewsItem 타입과 구분하여 크롤링 전용 타입으로 사용합니다.
 */

/**
 * 뉴스 카테고리
 *
 * - headlines: 실시간 속보 (메인)
 * - market: 시장 뉴스 (코스피/코스닥)
 * - disclosure: 기업 공시 뉴스 (공시.메모)
 * - world: 해외 증시
 * - bond: 채권/외환
 *
 * 참고: 네이버 금융 뉴스 URL 구조
 * - 실시간 속보: section_id2=258
 * - 시장: section_id2=258
 * - 공시.메모: section_id2=258, section_id3=406
 * - 해외증시: section_id2=262
 * - 채권/외환: section_id2=259
 */
export type CrawledNewsCategory = 'headlines' | 'market' | 'disclosure' | 'world' | 'bond';

/**
 * 크롤링된 뉴스 아이템 타입
 *
 * 네이버 금융 뉴스에서 추출한 데이터 구조입니다.
 */
export interface CrawledNewsItem {
  /** 뉴스 고유 ID (URL 해시 기반) */
  id: string;
  /** 뉴스 제목 */
  title: string;
  /** 원문 링크 URL */
  url: string;
  /** 언론사 이름 */
  source: string;
  /** 썸네일 이미지 URL (없으면 null) */
  thumbnail: string | null;
  /** 발행 시간 (상대적: "1시간 전", 절대적: "2024.01.15 10:30") */
  publishedAt: string;
  /** 뉴스 요약/설명 (없으면 null) */
  description: string | null;
  /** 뉴스 카테고리 */
  category: CrawledNewsCategory;
  /** 관련 종목 코드 (종목 뉴스인 경우) */
  stockCode?: string;
  /** 관련 종목명 (종목 뉴스인 경우) */
  stockName?: string;
}

/**
 * 뉴스 API 응답 타입
 */
export interface CrawledNewsResponse {
  /** 요청 성공 여부 */
  success: boolean;
  /** 뉴스 목록 */
  news: CrawledNewsItem[];
  /** 전체 뉴스 개수 */
  totalCount: number;
  /** 뉴스 카테고리 */
  category: CrawledNewsCategory;
  /** 캐시 정보 */
  cache: {
    /** 캐시 적중 여부 */
    hit: boolean;
    /** 캐시 만료 시간 (ISO 문자열) */
    expiresAt: string | null;
  };
  /** 조회 시간 (ISO 문자열) */
  timestamp: string;
}

/**
 * 뉴스 API 에러 응답 타입
 */
export interface CrawledNewsErrorResponse {
  /** 요청 성공 여부 */
  success: false;
  /** 에러 코드 */
  error: string;
  /** 에러 메시지 */
  message: string;
}

/**
 * 뉴스 카테고리 정보
 *
 * UI에서 탭 버튼을 렌더링할 때 사용합니다.
 * 각 카테고리는 고유 ID, 표시 라벨, 이모지 아이콘을 가집니다.
 *
 * 카테고리별 설명:
 * - headlines (실시간 속보): 메인 뉴스, 증권가 핫이슈
 * - market (시장): 코스피/코스닥 시장 동향 뉴스
 * - disclosure (공시): 기업 공시, 실적 발표, 대표이사 변경 등
 * - world (해외증시): 미국, 중국, 일본 등 해외 증시 뉴스
 * - bond (채권/외환): 채권 금리, 환율 동향 뉴스
 */
export const NEWS_CATEGORIES: { id: CrawledNewsCategory; label: string; emoji: string }[] = [
  { id: 'headlines', label: '실시간 속보', emoji: '🔥' },
  { id: 'market', label: '시장', emoji: '📈' },
  { id: 'disclosure', label: '공시', emoji: '📋' },
  { id: 'world', label: '해외증시', emoji: '🌍' },
  { id: 'bond', label: '채권/외환', emoji: '💱' },
];
