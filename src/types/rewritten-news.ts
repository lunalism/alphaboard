/**
 * AI 재작성 뉴스 타입 정의
 *
 * Claude AI로 재작성된 뉴스 콘텐츠의 타입을 정의합니다.
 * Firestore 캐싱 및 API 응답에 사용됩니다.
 *
 * ============================================================
 * Firestore 컬렉션:
 * ============================================================
 * rewrittenNews/{newsId}
 *   - 원본 뉴스 ID를 키로 사용
 *   - 24시간 TTL 적용
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// AI 재작성 결과 타입
// ============================================

/**
 * AI가 분석한 뉴스 투자 심리
 *
 * - positive: 호재 - 주가 상승에 긍정적인 뉴스
 * - negative: 악재 - 주가 하락에 부정적인 뉴스
 * - neutral: 중립 - 영향이 미미하거나 판단이 어려운 뉴스
 */
export type NewsSentiment = 'positive' | 'negative' | 'neutral';

/**
 * AI 재작성 뉴스 콘텐츠
 *
 * Claude AI가 생성한 투자자 관점의 뉴스 재작성 결과입니다.
 */
export interface RewrittenNewsContent {
  /** 핵심 요약 (2~3문장) */
  summary: string;
  /** 재작성된 본문 (300~500자) */
  content: string;
  /** 투자 포인트 목록 */
  investmentPoints: string[];
  /** 관련 종목 목록 */
  relatedStocks: string[];
  /** 투자 심리 (호재/악재/중립) */
  sentiment: NewsSentiment;
}

// ============================================
// Firestore 문서 타입
// ============================================

/**
 * Firestore에 저장되는 재작성 뉴스 문서
 *
 * 컬렉션 경로: rewrittenNews/{newsId}
 */
export interface FirestoreRewrittenNews extends RewrittenNewsContent {
  /** 원본 뉴스 ID */
  originalNewsId: string;
  /** 원본 뉴스 URL */
  originalUrl: string;
  /** 원본 뉴스 제목 */
  originalTitle: string;
  /** 원본 뉴스 출처 */
  originalSource: string;
  /** 생성 시간 */
  createdAt: Timestamp;
  /** 만료 시간 (TTL - 24시간) */
  expiresAt: Timestamp;
}

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * 뉴스 재작성 API 요청
 */
export interface RewriteNewsRequest {
  /** 원본 뉴스 ID */
  newsId: string;
  /** 원본 뉴스 URL */
  url: string;
  /** 원본 뉴스 제목 */
  title: string;
  /** 원본 뉴스 출처 */
  source: string;
  /** 원본 뉴스 내용 (있으면 URL 크롤링 생략) */
  content?: string;
}

/**
 * 뉴스 재작성 API 응답
 */
export interface RewriteNewsResponse {
  /** 요청 성공 여부 */
  success: boolean;
  /** 재작성된 콘텐츠 */
  data?: RewrittenNewsContent & {
    /** 원본 뉴스 URL */
    originalUrl: string;
    /** 원본 뉴스 제목 */
    originalTitle: string;
    /** 원본 뉴스 출처 */
    originalSource: string;
    /** 캐시에서 로드 여부 */
    fromCache: boolean;
  };
  /** 에러 메시지 */
  error?: string;
}

// ============================================
// 투자 심리 표시 설정
// ============================================

/**
 * 투자 심리별 UI 스타일
 */
export const SENTIMENT_CONFIG: Record<NewsSentiment, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  positive: {
    label: '호재',
    icon: '📈',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  negative: {
    label: '악재',
    icon: '📉',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  neutral: {
    label: '중립',
    icon: '➡️',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
};
