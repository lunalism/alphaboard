'use client';

/**
 * 관리자 베타 화이트리스트 관리 페이지
 *
 * 클로즈드 베타 초대 이메일을 관리합니다.
 * - 단건/일괄 이메일 추가
 * - 이메일 검색
 * - 이메일 삭제
 */

import { useState } from 'react';
import { useAdminBetaWhitelist } from '@/hooks/useAdminBetaWhitelist';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function AdminBetaPage() {
  const {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filteredEntries,
    entries,
    addEmail,
    addEmails,
    removeEmail,
  } = useAdminBetaWhitelist();

  // 단건 추가 폼
  const [singleEmail, setSingleEmail] = useState('');
  const [singleNote, setSingleNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 일괄 추가 폼
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkNote, setBulkNote] = useState('');
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 단건 추가 핸들러
  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    try {
      setIsAdding(true);
      await addEmail(singleEmail.trim(), singleNote.trim() || undefined);
      toast.success(`${singleEmail.trim()} 추가됨`);
      setSingleEmail('');
      setSingleNote('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  // 일괄 추가 핸들러
  const handleAddBulk = async () => {
    if (!bulkEmails.trim()) return;

    // 줄바꿈, 쉼표, 세미콜론으로 분리
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      toast.error('추가할 이메일이 없습니다.');
      return;
    }

    try {
      setIsBulkAdding(true);
      const result = await addEmails(emails, bulkNote.trim() || undefined);
      toast.success(`${result.added}건 추가됨${result.duplicates > 0 ? `, ${result.duplicates}건 중복` : ''}`);
      setBulkEmails('');
      setBulkNote('');
    } catch (err) {
      toast.error('일괄 추가에 실패했습니다.');
    } finally {
      setIsBulkAdding(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await removeEmail(deleteTarget);
      toast.success(`${deleteTarget} 삭제됨`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 날짜 포맷
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return '-';
    return new Date(timestamp.toDate()).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          베타 초대 관리
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          총 {entries.length}명 등록됨
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 추가 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 단건 추가 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            단건 추가
          </h2>
          <form onSubmit={handleAddSingle} className="space-y-3">
            <input
              type="email"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={singleNote}
              onChange={(e) => setSingleNote(e.target.value)}
              placeholder="메모 (선택)"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isAdding || !singleEmail.trim()}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? '추가 중...' : '추가'}
            </button>
          </form>
        </div>

        {/* 일괄 추가 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            일괄 추가
          </h2>
          <div className="space-y-3">
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="이메일 주소 (줄바꿈, 쉼표, 세미콜론으로 구분)"
              rows={4}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <input
              type="text"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="메모 (선택, 모든 항목에 동일 적용)"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddBulk}
              disabled={isBulkAdding || !bulkEmails.trim()}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBulkAdding ? '추가 중...' : '일괄 추가'}
            </button>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이메일 또는 메모로 검색..."
          className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 목록 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">불러오는 중...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 이메일이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    메모
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    등록자
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.email}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {entry.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(entry.addedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {entry.addedBy || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(entry.email)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              삭제 확인
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              <span className="font-medium text-gray-900 dark:text-white">{deleteTarget}</span>
              을(를) 화이트리스트에서 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
