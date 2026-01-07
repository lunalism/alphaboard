/**
 * 가격 알림 목록 페이지
 *
 * 사용자가 설정한 가격 알림 목록을 표시하고 관리하는 페이지
 *
 * 기능:
 * - 알림 목록 조회
 * - 알림 활성화/비활성화 토글
 * - 알림 삭제
 * - 종목 상세 페이지로 이동
 *
 * 경로: /alerts
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar, BottomNav } from '@/components/layout';
import { useAuthStore } from '@/stores';
import { useAlerts } from '@/hooks';
import { PriceAlert } from '@/types/priceAlert';
import { showSuccess, showError } from '@/lib/toast';

/**
 * 알림 카드 컴포넌트
 *
 * 개별 알림 정보를 표시하고 토글/삭제 버튼 제공
 */
function AlertCard({
  alert,
  onToggle,
  onDelete,
}: {
  alert: PriceAlert;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 시장에 따른 가격 포맷팅
  const formattedPrice =
    alert.market === 'KR'
      ? `${alert.targetPrice.toLocaleString('ko-KR')}원`
      : `$${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 종목 상세 페이지 URL
  const detailUrl =
    alert.market === 'KR'
      ? `/market/${alert.ticker}?market=kr`
      : `/market/${alert.ticker}?market=us`;

  // 토글 핸들러
  const handleToggle = async () => {
    setIsToggling(true);
    onToggle(alert.id, !alert.isActive);
    setIsToggling(false);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm('정말 이 알림을 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    onDelete(alert.id);
    setIsDeleting(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-opacity ${
        !alert.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* 종목 정보 */}
          <Link href={detailUrl} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 mb-1">
              {/* 시장 배지 */}
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  alert.market === 'KR'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {alert.market === 'KR' ? '한국' : '미국'}
              </span>
              {/* 티커 */}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {alert.ticker}
              </span>
              {/* 트리거 상태 */}
              {alert.isTriggered && (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                  발생됨
                </span>
              )}
            </div>
            {/* 종목명 */}
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {alert.stockName}
            </h3>
          </Link>

          {/* 토글 버튼 */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              alert.isActive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
            title={alert.isActive ? '알림 끄기' : '알림 켜기'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                alert.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 알림 조건 */}
        <div className="mt-3 flex items-center gap-3">
          {/* 방향 아이콘 */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              alert.direction === 'above'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {alert.direction === 'above' ? (
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            <span
              className={`text-sm font-medium ${
                alert.direction === 'above'
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}
            >
              {alert.direction === 'above' ? '이상' : '이하'}
            </span>
          </div>

          {/* 목표가 */}
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formattedPrice}
          </span>
        </div>

        {/* 생성일 및 삭제 버튼 */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(alert.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            설정
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 가격 알림 목록 페이지
 */
export default function AlertsPage() {
  const [activeMenu, setActiveMenu] = useState('alerts');

  // 인증 상태
  const { isLoggedIn } = useAuthStore();

  // 알림 데이터 및 액션
  const { alerts, isLoading, error, toggleAlert, deleteAlert, refetch } = useAlerts();

  /**
   * 알림 토글 핸들러
   */
  const handleToggle = async (id: string, isActive: boolean) => {
    const result = await toggleAlert(id, isActive);
    if (result.success) {
      showSuccess(isActive ? '알림이 활성화되었습니다' : '알림이 비활성화되었습니다');
    } else {
      showError(result.error || '알림 수정에 실패했습니다');
    }
  };

  /**
   * 알림 삭제 핸들러
   */
  const handleDelete = async (id: string) => {
    const result = await deleteAlert(id);
    if (result.success) {
      showSuccess('알림이 삭제되었습니다');
    } else {
      showError(result.error || '알림 삭제에 실패했습니다');
    }
  };

  // 활성/비활성 알림 분리
  const activeAlerts = alerts.filter((a) => a.isActive);
  const inactiveAlerts = alerts.filter((a) => !a.isActive);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900">
      {/* 사이드바 - 데스크톱 */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* 하단 네비게이션 - 모바일 */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* 메인 콘텐츠 */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">가격 알림</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                설정한 가격에 도달하면 알림을 받습니다
              </p>
            </div>
            {/* 새로고침 버튼 */}
            {isLoggedIn && (
              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="새로고침"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 비로그인 상태 */}
          {!isLoggedIn && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                가격 알림 기능을 사용하려면 로그인해주세요
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                로그인하기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoggedIn && isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 에러 상태 */}
          {isLoggedIn && error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 알림 목록 */}
          {isLoggedIn && !isLoading && !error && (
            <>
              {/* 알림이 없는 경우 */}
              {alerts.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    설정된 알림이 없습니다
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    종목 상세 페이지에서 알림을 추가해보세요
                  </p>
                  <Link
                    href="/market"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    시세 보러 가기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}

              {/* 활성 알림 */}
              {activeAlerts.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    활성 알림 ({activeAlerts.length})
                  </h2>
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 비활성 알림 */}
              {inactiveAlerts.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    비활성 알림 ({inactiveAlerts.length})
                  </h2>
                  <div className="space-y-3">
                    {inactiveAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
