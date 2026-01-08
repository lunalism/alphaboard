'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentAvatar?: string;
  onSave: (name: string) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  userId,
  currentName,
  currentAvatar,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  // 모달이 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      showError('표시 이름을 입력해주세요');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      showSuccess('프로필이 수정되었습니다');
      onSave(name.trim());
      onClose();
    } catch (err) {
      console.error('[EditProfileModal] 에러:', err);
      showError('프로필 수정에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name.trim() !== currentName;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">프로필 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 프로필 이미지 (읽기 전용) */}
        <div className="flex flex-col items-center mb-6">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="프로필 이미지"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            프로필 이미지는 Google 계정에서 가져옵니다
          </p>
        </div>

        {/* 표시 이름 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            표시 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSaving}
            maxLength={50}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || !name.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
