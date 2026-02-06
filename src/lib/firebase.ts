/**
 * Firebase 초기화 및 인스턴스 관리
 *
 * Firebase SDK v9+ 모듈러 방식 사용
 * 클라이언트 사이드에서만 초기화되도록 처리
 *
 * 주요 기능:
 * - Firebase 앱 초기화 (싱글톤 패턴)
 * - Auth 인스턴스 제공 (Google 로그인용)
 * - Firestore 인스턴스 제공 (사용자 프로필 저장용)
 * - Storage 인스턴스 제공 (이미지 업로드용)
 * - Messaging 인스턴스 제공 (푸시 알림용)
 *
 * 사용법:
 * import { auth, db, storage, getMessagingInstance } from '@/lib/firebase';
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from 'firebase/messaging';

/**
 * Firebase 설정 객체
 * 환경변수에서 값을 가져옴 (.env.local)
 *
 * 모든 값은 NEXT_PUBLIC_ 접두사가 붙어 클라이언트에서 접근 가능
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase 앱 인스턴스
 *
 * 이미 초기화된 앱이 있으면 기존 앱을 사용하고,
 * 없으면 새로 초기화합니다. (싱글톤 패턴)
 *
 * Next.js의 Hot Module Replacement(HMR)로 인해
 * 개발 중 여러 번 초기화될 수 있어서 이 패턴이 필요합니다.
 */
let app: FirebaseApp;

// 이미 초기화된 앱이 있는지 확인
if (getApps().length === 0) {
  // 초기화된 앱이 없으면 새로 초기화
  app = initializeApp(firebaseConfig);
} else {
  // 이미 초기화된 앱이 있으면 기존 앱 사용
  app = getApp();
}

/**
 * Firebase Auth 인스턴스
 *
 * Google 로그인, 로그아웃, 사용자 상태 관리에 사용
 * signInWithPopup, signOut, onAuthStateChanged 등의 메서드 사용
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore 인스턴스
 *
 * 사용자 프로필(users 컬렉션) 저장에 사용
 * 추후 관심종목 등 다른 데이터도 Firestore로 마이그레이션 예정
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Storage 인스턴스
 *
 * 이미지 파일 업로드에 사용
 * 공지사항, FAQ 등의 본문에 삽입되는 이미지 저장
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase 앱 인스턴스 (필요시 직접 접근용)
 */
export { app };

/**
 * Firebase 설정 확인용 (디버깅)
 * 개발 환경에서만 사용
 */
export const checkFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    console.log('[Firebase] 설정 확인:', {
      apiKey: firebaseConfig.apiKey ? '설정됨' : '미설정',
      authDomain: firebaseConfig.authDomain || '미설정',
      projectId: firebaseConfig.projectId || '미설정',
    });
  }
};

/**
 * Firebase Cloud Messaging (FCM) 인스턴스
 *
 * 브라우저 환경에서만 사용 가능합니다.
 * SSR 환경에서는 null을 반환합니다.
 *
 * 주의: getMessaging()은 브라우저 환경에서만 호출해야 합니다.
 * 서비스 워커에서는 별도의 firebase-messaging-sw.js를 사용합니다.
 *
 * @returns Messaging 인스턴스 또는 null (SSR 환경)
 */
let messagingInstance: Messaging | null = null;

export const getMessagingInstance = (): Messaging | null => {
  // 브라우저 환경에서만 초기화
  if (typeof window === 'undefined') {
    return null;
  }

  // 서비스 워커 환경에서는 null 반환 (SW에서는 별도 처리)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator === false) {
    console.warn('[Firebase] 서비스 워커를 지원하지 않는 브라우저입니다.');
    return null;
  }

  // 이미 초기화된 인스턴스가 있으면 반환
  if (messagingInstance) {
    return messagingInstance;
  }

  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('[Firebase] Messaging 초기화 에러:', error);
    return null;
  }
};

/**
 * VAPID 키 (공개 키)
 *
 * Firebase Console > Project Settings > Cloud Messaging > Web Push certificates에서 생성
 * 환경변수로 관리 (NEXT_PUBLIC_FIREBASE_VAPID_KEY)
 */
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
