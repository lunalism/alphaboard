/**
 * usePushNotification 훅
 *
 * PWA 푸시 알림 기능을 관리하는 훅입니다.
 * 프리미엄 사용자만 사용할 수 있습니다.
 *
 * ============================================================
 * 주요 기능:
 * ============================================================
 * - 푸시 알림 권한 상태 관리
 * - FCM 토큰 등록/삭제
 * - 푸시 알림 활성화/비활성화 토글
 * - 포그라운드 메시지 처리
 *
 * ============================================================
 * 사용 예시:
 * ============================================================
 * const {
 *   isSupported,
 *   permissionStatus,
 *   isEnabled,
 *   isLoading,
 *   enablePushNotification,
 *   disablePushNotification,
 * } = usePushNotification();
 *
 * // 푸시 알림 활성화
 * await enablePushNotification();
 *
 * // 푸시 알림 비활성화
 * await disablePushNotification();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  isPushNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  registerFCMToken,
  deleteFCMToken,
  setupForegroundMessageHandler,
  isIOSSafari,
  isPWAInstalled,
  type NotificationPermissionStatus,
} from '@/lib/fcm';
import { showCustom, showSuccess, showError } from '@/lib/toast';

/**
 * 푸시 알림 설정 상태 (Firestore에 저장)
 */
interface PushNotificationSettings {
  // 푸시 알림 활성화 여부
  enabled: boolean;
  // FCM 토큰 (현재 디바이스)
  currentToken?: string;
  // 마지막 업데이트 시간
  updatedAt?: unknown;
}

/**
 * usePushNotification 훅 반환 타입
 */
interface UsePushNotificationReturn {
  // 푸시 알림 지원 여부
  isSupported: boolean;
  // iOS Safari 여부 (제한적 지원)
  isIOSSafari: boolean;
  // PWA 설치 여부
  isPWAInstalled: boolean;
  // 알림 권한 상태
  permissionStatus: NotificationPermissionStatus;
  // 푸시 알림 활성화 여부 (Firestore 설정)
  isEnabled: boolean;
  // 로딩 중 여부
  isLoading: boolean;
  // 에러 메시지
  error: string | null;
  // 푸시 알림 활성화
  enablePushNotification: () => Promise<boolean>;
  // 푸시 알림 비활성화
  disablePushNotification: () => Promise<void>;
  // 권한 상태 새로고침
  refreshPermissionStatus: () => void;
}

/**
 * usePushNotification 훅
 */
export function usePushNotification(): UsePushNotificationReturn {
  // ========================================
  // 상태 관리
  // ========================================

  // 푸시 알림 지원 여부
  const [isSupported, setIsSupported] = useState(false);
  // iOS Safari 여부
  const [isIOS, setIsIOS] = useState(false);
  // PWA 설치 여부
  const [isPWA, setIsPWA] = useState(false);
  // 알림 권한 상태
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  // 푸시 알림 활성화 여부 (Firestore 설정)
  const [isEnabled, setIsEnabled] = useState(false);
  // 현재 FCM 토큰
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러
  const [error, setError] = useState<string | null>(null);

  // 인증 상태
  const { user, isPremium } = useAuth();

  // ========================================
  // 초기화: 푸시 알림 지원 여부 및 권한 상태 확인
  // ========================================

  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // 푸시 알림 지원 여부 확인
    setIsSupported(isPushNotificationSupported());
    setIsIOS(isIOSSafari());
    setIsPWA(isPWAInstalled());

    // 현재 알림 권한 상태 확인
    setPermissionStatus(getNotificationPermissionStatus());

    setIsLoading(false);
  }, []);

  // ========================================
  // Firestore에서 사용자 푸시 알림 설정 로드
  // ========================================

  useEffect(() => {
    if (!user?.uid) {
      setIsEnabled(false);
      setCurrentToken(null);
      return;
    }

    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'pushNotification');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as PushNotificationSettings;
          setIsEnabled(data.enabled || false);
          setCurrentToken(data.currentToken || null);
        } else {
          setIsEnabled(false);
          setCurrentToken(null);
        }
      } catch (err) {
        console.error('[usePushNotification] 설정 로드 실패:', err);
      }
    };

    loadSettings();
  }, [user?.uid]);

  // ========================================
  // 포그라운드 메시지 핸들러 설정
  // ========================================

  useEffect(() => {
    if (!isEnabled || !user?.uid) {
      return;
    }

    // 포그라운드 메시지 핸들러 등록
    const unsubscribe = setupForegroundMessageHandler((payload) => {
      // 토스트 알림으로 표시 (액션 버튼 포함)
      showCustom(payload.body, {
        icon: '📈',
        duration: 5000,
        action: payload.data?.ticker ? {
          label: '보기',
          onClick: () => {
            const market = payload.data?.market === 'KR' ? 'kr' : 'us';
            window.location.href = `/market/${payload.data?.ticker}?market=${market}`;
          },
        } : undefined,
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isEnabled, user?.uid]);

  // ========================================
  // 권한 상태 새로고침
  // ========================================

  const refreshPermissionStatus = useCallback(() => {
    if (typeof window !== 'undefined') {
      setPermissionStatus(getNotificationPermissionStatus());
    }
  }, []);

  // ========================================
  // 푸시 알림 활성화
  // ========================================

  const enablePushNotification = useCallback(async (): Promise<boolean> => {
    if (!user?.uid) {
      setError('로그인이 필요합니다.');
      showError('로그인이 필요합니다.');
      return false;
    }

    if (!isPremium) {
      setError('프리미엄 기능입니다.');
      showError('푸시 알림은 프리미엄 기능입니다.');
      return false;
    }

    if (!isSupported) {
      setError('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      showError('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      return false;
    }

    // iOS Safari 경고
    if (isIOS && !isPWA) {
      showCustom('iOS에서 푸시 알림을 받으려면 홈 화면에 앱을 추가해주세요.', {
        icon: 'ℹ️',
        duration: 5000,
      });
    }

    setIsLoading(true);
    setError(null);

    try {
      // FCM 토큰 발급 요청 (권한 요청 포함)
      const token = await requestNotificationPermission();

      if (!token) {
        // 권한 거부 또는 에러
        const status = getNotificationPermissionStatus();
        setPermissionStatus(status);

        if (status === 'denied') {
          setError('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
          showError('알림 권한이 거부되었습니다.');
        } else {
          setError('푸시 알림 설정에 실패했습니다.');
          showError('푸시 알림 설정에 실패했습니다.');
        }
        return false;
      }

      // 토큰을 Firestore에 저장
      await registerFCMToken(user.uid, token);

      // 설정 저장
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'pushNotification');
      await setDoc(settingsRef, {
        enabled: true,
        currentToken: token,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsEnabled(true);
      setCurrentToken(token);
      setPermissionStatus('granted');

      showSuccess('푸시 알림이 활성화되었습니다.');
      return true;
    } catch (err) {
      console.error('[usePushNotification] 활성화 실패:', err);
      setError('푸시 알림 설정에 실패했습니다.');
      showError('푸시 알림 설정에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, isPremium, isSupported, isIOS, isPWA]);

  // ========================================
  // 푸시 알림 비활성화
  // ========================================

  const disablePushNotification = useCallback(async (): Promise<void> => {
    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 현재 토큰 삭제
      if (currentToken) {
        await deleteFCMToken(user.uid, currentToken);
      }

      // 설정 업데이트
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'pushNotification');
      await setDoc(settingsRef, {
        enabled: false,
        currentToken: null,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setIsEnabled(false);
      setCurrentToken(null);

      showSuccess('푸시 알림이 비활성화되었습니다.');
    } catch (err) {
      console.error('[usePushNotification] 비활성화 실패:', err);
      setError('푸시 알림 해제에 실패했습니다.');
      showError('푸시 알림 해제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, currentToken]);

  // ========================================
  // 반환값
  // ========================================

  return {
    isSupported,
    isIOSSafari: isIOS,
    isPWAInstalled: isPWA,
    permissionStatus,
    isEnabled,
    isLoading,
    error,
    enablePushNotification,
    disablePushNotification,
    refreshPermissionStatus,
  };
}

export default usePushNotification;
