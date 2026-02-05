/**
 * 알림 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /alerts 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/alerts');

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
