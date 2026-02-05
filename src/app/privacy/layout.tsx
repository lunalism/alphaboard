/**
 * 개인정보처리방침 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /privacy 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/privacy');

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
