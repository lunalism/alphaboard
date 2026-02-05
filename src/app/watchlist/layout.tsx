/**
 * 관심종목 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /watchlist 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/watchlist');

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
