'use client';

/**
 * 계정 정지 안내 페이지
 *
 * 밴 처리된 사용자가 리다이렉트되는 페이지입니다.
 * useAuth() 사용 안 함 (로그아웃 상태이므로)
 */

import Link from 'next/link';

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 아이콘 */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            계정이 정지되었습니다
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            이용약관 위반으로 계정이 정지되었습니다.<br />
            자세한 내용은 아래 이메일로 문의해주세요.
          </p>
        </div>

        {/* 문의 이메일 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">문의 이메일</p>
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
