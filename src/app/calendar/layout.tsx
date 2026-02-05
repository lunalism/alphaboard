/**
 * 캘린더 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /calendar 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/calendar');

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
