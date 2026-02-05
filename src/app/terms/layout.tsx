/**
 * 이용약관 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /terms 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/terms');

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
