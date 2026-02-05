/**
 * Schema.org 구조화 데이터 컴포넌트
 *
 * JSON-LD 형식의 구조화 데이터를 <script type="application/ld+json">으로 삽입합니다.
 * 검색 엔진이 사이트의 콘텐츠를 더 정확하게 이해하고,
 * 리치 스니펫(Rich Snippet)으로 검색 결과에 표시할 수 있습니다.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 * @see https://schema.org
 */

import { SITE_URL, SITE_NAME, SITE_LOGO, SITE_DESCRIPTION } from '@/lib/seo-config';

// ============================================
// 1. Organization 스키마 (조직 정보)
// ============================================

/**
 * Organization 구조화 데이터
 *
 * 사이트 전체에 적용되는 조직 정보입니다.
 * Google 검색에서 조직명, 로고가 표시될 수 있습니다.
 * 루트 layout.tsx에서 한 번만 사용합니다.
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description: SITE_DESCRIPTION,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// 2. WebSite 스키마 (웹사이트 정보 + 검색)
// ============================================

/**
 * WebSite 구조화 데이터 + SearchAction
 *
 * Google 검색에서 사이트 내 검색 기능(Sitelinks Searchbox)이 표시될 수 있습니다.
 * potentialAction으로 /search?q={query} 검색 URL 패턴을 등록합니다.
 * 루트 layout.tsx에서 한 번만 사용합니다.
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    // 사이트 내 검색 기능 연동 (Sitelinks Searchbox)
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// 3. WebPage 스키마 (개별 페이지 정보)
// ============================================

interface WebPageSchemaProps {
  /** 페이지 이름/제목 */
  name: string;
  /** 페이지 설명 */
  description: string;
  /** 페이지 URL (canonical URL) */
  url: string;
}

/**
 * WebPage 구조화 데이터
 *
 * 각 페이지에 범용으로 사용할 수 있는 웹 페이지 스키마입니다.
 * 검색 엔진이 페이지의 기본 정보를 파악하는 데 도움됩니다.
 */
export function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// 4. FAQPage 스키마 (FAQ 페이지 전용)
// ============================================

interface FAQItem {
  /** 질문 텍스트 */
  question: string;
  /** 답변 텍스트 (HTML 태그 제거된 순수 텍스트) */
  answer: string;
}

interface FAQPageSchemaProps {
  /** FAQ 질문/답변 배열 */
  items: FAQItem[];
}

/**
 * FAQPage 구조화 데이터
 *
 * FAQ 페이지에서 사용합니다.
 * Google 검색 결과에 질문/답변이 리치 스니펫으로 표시될 수 있습니다.
 *
 * @example
 * <FAQPageSchema items={[
 *   { question: '무료인가요?', answer: '네, 기본 기능은 무료입니다.' },
 * ]} />
 */
export function FAQPageSchema({ items }: FAQPageSchemaProps) {
  // FAQ 항목이 없으면 렌더링하지 않음
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// 5. BreadcrumbList 스키마 (경로 탐색)
// ============================================

interface BreadcrumbItem {
  /** 표시 이름 */
  name: string;
  /** 페이지 URL */
  url: string;
}

interface BreadcrumbSchemaProps {
  /** 경로 항목 배열 (순서대로) */
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList 구조화 데이터
 *
 * 페이지의 경로 탐색 구조를 검색 엔진에 알립니다.
 * Google 검색 결과에 경로가 표시될 수 있습니다.
 *
 * @example
 * <BreadcrumbSchema items={[
 *   { name: '홈', url: 'https://tickerbird.vercel.app' },
 *   { name: '시세', url: 'https://tickerbird.vercel.app/market' },
 * ]} />
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
