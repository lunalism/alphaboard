/**
 * Firebase Admin SDK 초기화
 *
 * 서버사이드에서 Firebase 서비스에 접근하기 위한 Admin SDK입니다.
 * FCM 푸시 알림 발송, Firestore 관리자 접근 등에 사용됩니다.
 *
 * ============================================================
 * 환경변수:
 * ============================================================
 * FIREBASE_SERVICE_ACCOUNT_KEY - Firebase 서비스 계정 키 (JSON 문자열)
 *
 * Firebase Console > Project Settings > Service Accounts에서
 * "Generate new private key" 버튼을 클릭하여 다운로드한 JSON 파일의
 * 내용을 한 줄로 변환하여 환경변수에 설정합니다.
 *
 * ============================================================
 * 주의사항:
 * ============================================================
 * - 이 모듈은 서버사이드에서만 사용해야 합니다
 * - 클라이언트 번들에 포함되면 안 됩니다
 * - 환경변수는 반드시 Vercel 환경변수에 설정해야 합니다
 * - 빌드 시점에는 초기화하지 않고, 런타임에 lazy 초기화합니다
 */

import * as admin from 'firebase-admin';

/**
 * Firebase Admin 앱 인스턴스 (lazy 초기화)
 */
let _adminApp: admin.app.App | null = null;

/**
 * Firebase Admin 앱 인스턴스 가져오기
 *
 * 싱글톤 패턴으로 한 번만 초기화됩니다.
 * 이미 초기화된 앱이 있으면 기존 앱을 반환합니다.
 *
 * @throws 환경변수가 설정되지 않은 경우 에러
 */
function getAdminApp(): admin.app.App {
  // 이미 초기화된 앱이 있으면 반환
  if (_adminApp) {
    return _adminApp;
  }

  // 기존에 초기화된 Firebase Admin 앱이 있는지 확인
  if (admin.apps.length > 0) {
    _adminApp = admin.apps[0]!;
    return _adminApp;
  }

  // 서비스 계정 키 가져오기
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다. ' +
      'Vercel Dashboard > Settings > Environment Variables에서 설정하세요.'
    );
  }

  try {
    // JSON 문자열을 객체로 파싱
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Firebase Admin 초기화
    _adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('[Firebase Admin] 초기화 완료');
    return _adminApp;
  } catch (error) {
    console.error('[Firebase Admin] 초기화 실패:', error);
    throw error;
  }
}

/**
 * Firestore Admin 인스턴스 가져오기
 *
 * 서버사이드에서 Firestore에 관리자 권한으로 접근합니다.
 */
export function getAdminDb(): admin.firestore.Firestore {
  return admin.firestore(getAdminApp());
}

/**
 * Firebase Cloud Messaging Admin 인스턴스 가져오기
 *
 * 서버사이드에서 FCM 푸시 알림을 발송합니다.
 */
export function getAdminMessaging(): admin.messaging.Messaging {
  return admin.messaging(getAdminApp());
}

/**
 * Firebase Auth Admin 인스턴스 가져오기
 *
 * 서버사이드에서 사용자 인증 정보를 관리합니다.
 */
export function getAdminAuth(): admin.auth.Auth {
  return admin.auth(getAdminApp());
}

// 편의를 위한 getter 프로퍼티 (기존 코드와 호환성 유지)
// Proxy를 사용하여 모든 Firestore 메서드를 지원
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = (db as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
});

// Proxy를 사용하여 모든 Messaging 메서드를 지원
export const adminMessaging = new Proxy({} as admin.messaging.Messaging, {
  get(_target, prop) {
    const messaging = getAdminMessaging();
    const value = (messaging as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return value.bind(messaging);
    }
    return value;
  },
});

export default admin;
