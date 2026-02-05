/**
 * SEO 메타데이터 유틸리티
 *
 * 페이지 경로를 기반으로 Next.js Metadata 객체를 자동 생성합니다.
 * - canonical URL 자동 생성
 * - og:url 동적 설정 (페이지별 고유 URL)
 * - og:title, og:description 자동 매핑
 * - twitter:card 자동 세팅
 * - alternates.canonical 설정
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */

import type { Metadata } from 'next';
import { PAGE_SEO, SITE_URL, SITE_NAME, SITE_LOGO, type PageSEO } from './seo-config';

/**
 * 페이지별 Next.js Metadata 객체 생성
 *
 * 사용법: 각 라우트의 layout.tsx에서 호출
 *
 * @param path - 페이지 경로 (예: '/market', '/calendar')
 * @param overrides - 추가/덮어쓸 메타데이터 (선택)
 * @returns Next.js Metadata 객체
 *
 * @example
 * // src/app/market/layout.tsx
 * import { createPageMetadata } from '@/lib/metadata';
 * export const metadata = createPageMetadata('/market');
 */
export function createPageMetadata(
  path: string,
  overrides?: Partial<PageSEO>
): Metadata {
  // seo-config에서 해당 경로의 메타데이터 조회
  const pageSEO = PAGE_SEO[path];

  if (!pageSEO) {
    // 설정이 없는 경로는 기본 메타데이터 반환
    return {};
  }

  // 사용자 정의 값으로 덮어쓰기 (있는 경우)
  const title = overrides?.title || pageSEO.title;
  const description = overrides?.description || pageSEO.description;
  const keywords = overrides?.keywords || pageSEO.keywords;
  const noIndex = overrides?.noIndex ?? pageSEO.noIndex;

  // canonical URL 생성: 사이트 기본 URL + 경로
  // 홈페이지('/')는 트레일링 슬래시 없이 기본 URL만 사용
  const canonicalUrl = path === '/' ? SITE_URL : `${SITE_URL}${path}`;

  // Next.js Metadata 객체 구성
  const metadata: Metadata = {
    // 페이지 고유 제목
    title,

    // 페이지 고유 설명 (검색 결과에 표시)
    description,

    // 키워드 (있는 경우만)
    ...(keywords && { keywords }),

    // canonical URL 설정 (검색 엔진에 정규 URL 알림)
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph 메타데이터 (소셜 미디어 공유용)
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      url: canonicalUrl,           // 페이지별 고유 URL (이전: 모두 홈 URL로 고정)
      siteName: SITE_NAME,
      title,                       // 페이지별 고유 제목
      description,                 // 페이지별 고유 설명
      images: [
        {
          url: SITE_LOGO,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} 로고`,
        },
      ],
    },

    // Twitter Card 메타데이터
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_LOGO],
    },
  };

  // noIndex 페이지 처리 (로그인 등 검색 엔진 인덱싱 불필요한 페이지)
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
