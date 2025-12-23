/**
 * StockRowSkeleton 컴포넌트
 *
 * 종목 테이블 행 로딩 스켈레톤입니다.
 * StockTable의 행과 동일한 레이아웃을 가집니다.
 *
 * 구조:
 * - 순위
 * - 로고 (원형)
 * - 종목명
 * - 티커
 * - 현재가
 * - 등락률
 * - 거래량 (데스크톱에서만 표시)
 */

import { Skeleton, SkeletonCircle } from './Skeleton';

export function StockRowSkeleton() {
  return (
    <tr className="border-b border-gray-50 dark:border-gray-700">
      {/* 순위 */}
      <td className="py-4 px-4">
        <SkeletonCircle size={24} />
      </td>
      {/* 종목명 + 로고 */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {/* 회사 로고 */}
          <SkeletonCircle size={32} />
          {/* 종목명 */}
          <Skeleton width={100} height={16} rounded="md" />
        </div>
      </td>
      {/* 티커 */}
      <td className="py-4 px-4">
        <Skeleton width={50} height={14} rounded="md" />
      </td>
      {/* 현재가 */}
      <td className="py-4 px-4 text-right">
        <Skeleton width={80} height={16} rounded="md" className="ml-auto" />
      </td>
      {/* 등락률 */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton width={50} height={14} rounded="md" />
          <Skeleton width={55} height={20} rounded="full" />
        </div>
      </td>
      {/* 거래량: 태블릿에서 숨김, 데스크톱에서 표시 */}
      <td className="hidden lg:table-cell py-4 px-4 text-right">
        <Skeleton width={70} height={14} rounded="md" className="ml-auto" />
      </td>
    </tr>
  );
}

/**
 * StockCardSkeleton 컴포넌트
 *
 * 모바일용 종목 카드 스켈레톤입니다.
 * StockTable의 모바일 카드 레이아웃과 동일한 구조입니다.
 */
export function StockCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      {/* 상단: 순위 + 로고 + 종목명/티커 */}
      <div className="flex items-center gap-3 mb-3">
        {/* 순위 배지 */}
        <SkeletonCircle size={28} />
        {/* 로고 */}
        <SkeletonCircle size={32} />
        {/* 종목명 + 티커 */}
        <div className="flex-1 min-w-0">
          <Skeleton width={120} height={16} rounded="md" className="mb-1" />
          <Skeleton width={60} height={14} rounded="md" />
        </div>
      </div>

      {/* 중단: 현재가 + 등락폭/등락률 */}
      <div className="flex items-center justify-between mb-2">
        {/* 현재가 */}
        <Skeleton width={80} height={18} rounded="md" />
        {/* 등락폭 + 등락률 */}
        <div className="flex items-center gap-2">
          <Skeleton width={50} height={14} rounded="md" />
          <Skeleton width={55} height={20} rounded="full" />
        </div>
      </div>

      {/* 하단: 거래량 */}
      <Skeleton width={100} height={14} rounded="md" />
    </div>
  );
}

/**
 * StockTableSkeleton 컴포넌트
 *
 * 반응형 종목 테이블 스켈레톤입니다.
 * - 모바일 (767px 이하): 카드 리스트
 * - 태블릿 (768px~1023px): 테이블 (거래량 숨김)
 * - 데스크톱 (1024px+): 전체 테이블
 *
 * @param rowCount - 표시할 행/카드 개수 (기본: 10)
 */
interface StockTableSkeletonProps {
  rowCount?: number;
}

export function StockTableSkeleton({ rowCount = 10 }: StockTableSkeletonProps) {
  return (
    <>
      {/* ========================================
          모바일 카드 스켈레톤 (767px 이하)
          ======================================== */}
      <div className="md:hidden flex flex-col gap-3">
        {Array.from({ length: rowCount }).map((_, index) => (
          <StockCardSkeleton key={index} />
        ))}
      </div>

      {/* ========================================
          태블릿/데스크톱 테이블 스켈레톤 (768px 이상)
          ======================================== */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* 테이블 헤더 */}
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  순위
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  종목명
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  티커
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  현재가
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  등락률
                </th>
                {/* 거래량: 태블릿에서 숨김, 데스크톱에서 표시 */}
                <th className="hidden lg:table-cell text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  거래량
                </th>
              </tr>
            </thead>
            {/* 테이블 바디 - 스켈레톤 행들 */}
            <tbody>
              {Array.from({ length: rowCount }).map((_, index) => (
                <StockRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
