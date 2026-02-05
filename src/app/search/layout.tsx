/**
 * 검색 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /search 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/search');

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
