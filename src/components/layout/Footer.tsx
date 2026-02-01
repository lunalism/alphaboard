'use client';

/**
 * Footer - 사이트 푸터 컴포넌트
 *
 * 개인정보처리방침, 이용약관 등의 링크를 표시합니다.
 * 모바일에서는 BottomNav 위에 표시됩니다.
 */

import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 링크 목록 */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/terms"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              개인정보처리방침
            </Link>
          </div>

          {/* 저작권 표시 */}
          <div className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} Tickerbird. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
