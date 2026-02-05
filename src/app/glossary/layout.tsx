/**
 * 용어사전 페이지 레이아웃 - SEO 메타데이터 제공
 */

import { createPageMetadata } from '@/lib/metadata';

/** /glossary 페이지 고유 메타데이터 */
export const metadata = createPageMetadata('/glossary');

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
