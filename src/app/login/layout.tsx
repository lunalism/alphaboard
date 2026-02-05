/**
 * 로그인 페이지 레이아웃 - SEO 메타데이터 제공
 *
 * 로그인 페이지는 검색 엔진 인덱싱 대상에서 제외합니다.
 * robots: { index: false, follow: false } 설정.
 */

import { createPageMetadata } from '@/lib/metadata';

/** /login 페이지 메타데이터 (noindex, nofollow) */
export const metadata = createPageMetadata('/login');

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
