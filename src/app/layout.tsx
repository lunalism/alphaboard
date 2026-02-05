/**
 * 루트 레이아웃 컴포넌트
 *
 * ============================================================
 * PWA (Progressive Web App) 설정:
 * ============================================================
 * - manifest.json 링크
 * - Apple Touch Icon
 * - 테마 컬러
 * - iOS Safari 전체화면 모드
 *
 * ============================================================
 * SEO 메타데이터:
 * ============================================================
 * - Open Graph
 * - Twitter Card
 * - 아이콘
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, ToastProvider, AuthProvider, PriceAlertProvider } from "@/components/providers";
import { OfflineIndicator, BetaWelcomeModal } from "@/components/common";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/StructuredData";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/seo-config";
import { createPageMetadata } from "@/lib/metadata";

// ==================== 메타데이터 설정 ====================

/**
 * 루트 레이아웃 메타데이터
 *
 * 이 메타데이터는 홈페이지('/')에 적용되며,
 * 하위 라우트의 layout.tsx에서 페이지별로 오버라이드됩니다.
 * (Next.js Metadata Merging: 하위가 상위를 덮어씀)
 */
const homeMetadata = createPageMetadata('/');

export const metadata: Metadata = {
  // 홈 페이지 고유 메타데이터 (createPageMetadata에서 생성)
  ...homeMetadata,

  // 앱 이름 (PWA)
  applicationName: SITE_NAME,

  // 작성자
  authors: [{ name: "Tickerbird Team" }],

  // 생성기
  generator: "Next.js",

  // PWA manifest
  manifest: "/manifest.json",

  // 아이콘 설정
  icons: {
    // Favicon
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    // Apple Touch Icon
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    // 기타 아이콘
    other: [
      { rel: "mask-icon", url: "/icons/icon-512x512.png", color: "#3b82f6" },
    ],
  },

  // Apple 관련 메타
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },

  // 포맷 감지 비활성화
  formatDetection: {
    telephone: false,
  },

  // 검색 엔진 크롤링 설정 (기본: 인덱싱 허용)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 기타 메타 정보
  category: 'finance',
};

// ==================== 뷰포트 설정 ====================

export const viewport: Viewport = {
  // 기본 뷰포트
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,

  // iOS Safari safe area
  viewportFit: 'cover',

  // 테마 컬러 (브라우저 UI 색상)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// ==================== 루트 레이아웃 ====================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* PWA 추가 메타 태그 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

        {/* Microsoft 타일 */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Schema.org 구조화 데이터 (전체 사이트 공통) */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <PriceAlertProvider>
              <ToastProvider />
              <OfflineIndicator />
              <BetaWelcomeModal />
              {children}
            </PriceAlertProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
