/**
 * 용어사전 관련 타입 정의
 */

// 용어 카테고리
export type GlossaryCategory =
  | 'economic'      // 경제지표
  | 'central-bank'  // 중앙은행
  | 'finance'       // 금융
  | 'technical'     // 기술적분석
  | 'crypto';       // 암호화폐

// 용어 카테고리 필터
export interface GlossaryCategoryFilter {
  id: GlossaryCategory | 'all';
  label: string;
  emoji: string;
}

// 용어 항목
export interface GlossaryTerm {
  id: string;
  abbreviation: string;      // 영문 약어 (예: CPI)
  fullName: string;          // 영문 전체명 (예: Consumer Price Index)
  korean: string;            // 한글 번역 (예: 소비자물가지수)
  category: GlossaryCategory;
  description: string;       // 상세 설명 (2-3문장)
  relatedTerms?: string[];   // 관련 용어 ID (선택)
}
