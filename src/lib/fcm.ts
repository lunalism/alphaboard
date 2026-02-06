/**
 * Firebase Cloud Messaging (FCM) 유틸리티
 *
 * 푸시 알림 토큰 관리 및 알림 권한 처리를 담당합니다.
 *
 * ============================================================
 * 주요 기능:
 * ============================================================
 * - 알림 권한 요청 (requestNotificationPermission)
 * - FCM 토큰 등록/갱신 (registerFCMToken)
 * - FCM 토큰 삭제 (deleteFCMToken)
 * - 포그라운드 메시지 핸들러 설정 (setupForegroundMessageHandler)
 * - 서비스 워커 등록 (registerServiceWorker)
 *
 * ============================================================
 * Firestore 구조:
 * ============================================================
 * users/{uid}/fcmTokens/{tokenId}
 * - token: string (FCM 토큰)
 * - createdAt: timestamp
 * - userAgent: string (디바이스 정보)
 * - platform: string (web)
 *
 * ============================================================
 * 사용 예시:
 * ============================================================
 * import { requestNotificationPermission, registerFCMToken } from '@/lib/fcm';
 *
 * const token = await requestNotificationPermission();
 * if (token) {
 *   await registerFCMToken(userId, token);
 * }
 */

import { getToken, onMessage, type Messaging } from 'firebase/messaging';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db, getMessagingInstance, VAPID_KEY } from './firebase';

/**
 * FCM 토큰 정보 타입
 */
export interface FCMTokenData {
  // FCM 토큰 문자열
  token: string;
  // 생성 시간
  createdAt: unknown;
  // 마지막 갱신 시간
  updatedAt: unknown;
  // 사용자 에이전트 (디바이스 정보)
  userAgent: string;
  // 플랫폼 (web, android, ios)
  platform: 'web';
}

/**
 * 알림 권한 상태
 */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * FCM 서비스 워커 등록
 *
 * Firebase Messaging 서비스 워커를 브라우저에 등록합니다.
 * 이 서비스 워커가 백그라운드 푸시 알림을 처리합니다.
 *
 * @returns 등록된 ServiceWorkerRegistration 또는 null
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    return null;
  }

  // 서비스 워커 지원 체크
  if (!('serviceWorker' in navigator)) {
    console.warn('[FCM] 서비스 워커를 지원하지 않는 브라우저입니다.');
    return null;
  }

  try {
    // Firebase Messaging 서비스 워커 등록
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );

    console.log('[FCM] 서비스 워커 등록 성공:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[FCM] 서비스 워커 등록 실패:', error);
    return null;
  }
}

/**
 * 알림 권한 상태 확인
 *
 * 현재 알림 권한 상태를 반환합니다.
 *
 * @returns 권한 상태 ('granted' | 'denied' | 'default' | 'unsupported')
 */
export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    return 'unsupported';
  }

  // Notification API 지원 체크
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission as NotificationPermissionStatus;
}

/**
 * 알림 권한 요청 및 FCM 토큰 발급
 *
 * 사용자에게 알림 권한을 요청하고, 허용되면 FCM 토큰을 발급받습니다.
 *
 * @returns FCM 토큰 또는 null (권한 거부/에러 시)
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    console.warn('[FCM] 브라우저 환경이 아닙니다.');
    return null;
  }

  // Notification API 지원 체크
  if (!('Notification' in window)) {
    console.warn('[FCM] 알림을 지원하지 않는 브라우저입니다.');
    return null;
  }

  // VAPID 키 체크
  if (!VAPID_KEY) {
    console.error('[FCM] VAPID 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    console.log('[FCM] 알림 권한 상태:', permission);

    if (permission !== 'granted') {
      console.warn('[FCM] 알림 권한이 거부되었습니다.');
      return null;
    }

    // 서비스 워커 등록
    const swRegistration = await registerServiceWorker();
    if (!swRegistration) {
      console.error('[FCM] 서비스 워커 등록 실패');
      return null;
    }

    // Firebase Messaging 인스턴스 가져오기
    const messaging = getMessagingInstance();
    if (!messaging) {
      console.error('[FCM] Messaging 인스턴스를 가져올 수 없습니다.');
      return null;
    }

    // FCM 토큰 발급
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.error('[FCM] 토큰 발급 실패');
      return null;
    }

    console.log('[FCM] 토큰 발급 성공:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('[FCM] 권한 요청 또는 토큰 발급 실패:', error);
    return null;
  }
}

/**
 * FCM 토큰을 Firestore에 저장
 *
 * 사용자의 FCM 토큰을 Firestore에 저장합니다.
 * 한 사용자가 여러 디바이스에서 로그인할 수 있으므로
 * users/{uid}/fcmTokens 서브컬렉션에 저장합니다.
 *
 * @param userId - 사용자 UID
 * @param token - FCM 토큰
 */
export async function registerFCMToken(userId: string, token: string): Promise<void> {
  if (!userId || !token) {
    console.error('[FCM] userId 또는 token이 없습니다.');
    return;
  }

  try {
    // 토큰을 문서 ID로 사용 (중복 방지)
    // 토큰이 너무 길어서 해시값 사용
    const tokenId = await hashToken(token);
    const tokenDocRef = doc(db, 'users', userId, 'fcmTokens', tokenId);

    const tokenData: FCMTokenData = {
      token,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      platform: 'web',
    };

    await setDoc(tokenDocRef, tokenData, { merge: true });
    console.log('[FCM] 토큰 저장 완료:', tokenId);
  } catch (error) {
    console.error('[FCM] 토큰 저장 실패:', error);
    throw error;
  }
}

/**
 * FCM 토큰 삭제
 *
 * 사용자의 FCM 토큰을 Firestore에서 삭제합니다.
 * 로그아웃 또는 푸시 알림 비활성화 시 호출합니다.
 *
 * @param userId - 사용자 UID
 * @param token - 삭제할 FCM 토큰 (없으면 모든 토큰 삭제)
 */
export async function deleteFCMToken(userId: string, token?: string): Promise<void> {
  if (!userId) {
    console.error('[FCM] userId가 없습니다.');
    return;
  }

  try {
    if (token) {
      // 특정 토큰만 삭제
      const tokenId = await hashToken(token);
      const tokenDocRef = doc(db, 'users', userId, 'fcmTokens', tokenId);
      await deleteDoc(tokenDocRef);
      console.log('[FCM] 토큰 삭제 완료:', tokenId);
    } else {
      // 모든 토큰 삭제 (로그아웃 시)
      const tokensRef = collection(db, 'users', userId, 'fcmTokens');
      const tokensSnapshot = await getDocs(query(tokensRef));

      const deletePromises = tokensSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log('[FCM] 모든 토큰 삭제 완료');
    }
  } catch (error) {
    console.error('[FCM] 토큰 삭제 실패:', error);
    throw error;
  }
}

/**
 * 사용자의 모든 FCM 토큰 조회
 *
 * @param userId - 사용자 UID
 * @returns FCM 토큰 문자열 배열
 */
export async function getUserFCMTokens(userId: string): Promise<string[]> {
  if (!userId) {
    return [];
  }

  try {
    const tokensRef = collection(db, 'users', userId, 'fcmTokens');
    const tokensSnapshot = await getDocs(query(tokensRef));

    const tokens = tokensSnapshot.docs.map((doc) => {
      const data = doc.data() as FCMTokenData;
      return data.token;
    });

    return tokens;
  } catch (error) {
    console.error('[FCM] 토큰 조회 실패:', error);
    return [];
  }
}

/**
 * 포그라운드 메시지 핸들러 설정
 *
 * 앱이 포그라운드(열려있는 상태)일 때 푸시 메시지를 처리합니다.
 * 토스트 알림이나 인앱 알림으로 표시할 수 있습니다.
 *
 * @param onMessageReceived - 메시지 수신 시 호출할 콜백
 * @returns 구독 해제 함수
 */
export function setupForegroundMessageHandler(
  onMessageReceived: (payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) => void
): (() => void) | null {
  const messaging = getMessagingInstance();

  if (!messaging) {
    console.warn('[FCM] Messaging 인스턴스가 없습니다.');
    return null;
  }

  // 포그라운드 메시지 리스너 등록
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('[FCM] 포그라운드 메시지 수신:', payload);

    onMessageReceived({
      title: payload.notification?.title || '📈 Tickerbird',
      body: payload.notification?.body || '새로운 알림이 있습니다.',
      data: payload.data,
    });
  });

  return unsubscribe;
}

/**
 * 토큰 해시 함수
 *
 * FCM 토큰을 Firestore 문서 ID로 사용하기 위해 해시합니다.
 * (토큰이 너무 길어서 문서 ID로 직접 사용할 수 없음)
 *
 * @param token - FCM 토큰
 * @returns 해시된 토큰 ID
 */
async function hashToken(token: string): Promise<string> {
  // 브라우저 환경에서 SubtleCrypto 사용
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32); // 앞 32자만 사용
  }

  // 서버 환경 또는 SubtleCrypto 미지원 시 간단한 해시
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash).toString(16);
}

/**
 * 푸시 알림 지원 여부 확인
 *
 * @returns 푸시 알림 지원 여부
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * iOS Safari 여부 확인
 *
 * iOS Safari는 웹 푸시를 제한적으로 지원합니다.
 * iOS 16.4+ 부터 지원하며, 홈 화면에 추가(PWA)해야 합니다.
 *
 * @returns iOS Safari 여부
 */
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);

  return isIOS && isSafari;
}

/**
 * PWA로 설치되었는지 확인
 *
 * @returns PWA 설치 여부
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // standalone 모드로 실행 중인지 확인
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // iOS Safari의 standalone 확인
  const isIOSStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isStandalone || isIOSStandalone;
}
