/**
 * FAQ 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /faq 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/faq');

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
