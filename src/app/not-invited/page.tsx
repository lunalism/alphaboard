'use client';

/**
 * 클로즈드 베타 미초대 안내 페이지
 *
 * 화이트리스트에 없는 사용자가 리다이렉트되는 페이지입니다.
 * useAuth() 사용 안 함 (로그아웃 상태이므로)
 */

import Link from 'next/link';

export default function NotInvitedPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 아이콘 */}
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            클로즈드 베타 기간입니다
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            현재 초대된 사용자만 이용할 수 있습니다.<br />
            오픈 베타 전환 시 누구나 이용 가능합니다.
          </p>
        </div>

        {/* 문의 안내 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">초대 요청 및 문의</p>
          <a
            href="mailto:support@tickerbird.io"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            support@tickerbird.io
          </a>
        </div>

        {/* 로그인 페이지 링크 */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
