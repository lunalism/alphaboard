/**
 * 시세 페이지 레이아웃 - SEO 메타데이터 제공
 *
 * 'use client'가 아닌 서버 컴포넌트로, Next.js Metadata API를 통해
 * /market 페이지에 고유한 title, description, canonical URL을 설정합니다.
 */

import { createPageMetadata } from '@/lib/metadata';

/** /market 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/market');

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
