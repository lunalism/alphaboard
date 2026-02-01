/**
 * 아바타 상수 및 유틸리티 함수
 *
 * Tickerbird에서 사용하는 동물 아바타 목록과 관련 유틸리티 함수를 정의합니다.
 * 모든 아바타 이미지는 /public/avatars/ 폴더에 정적 파일로 제공됩니다.
 *
 * 아바타 선택 우선순위:
 * 1. avatarId가 있으면 → 해당 아바타 이미지 표시
 * 2. photoURL이 있으면 → Google 프로필 사진 표시
 * 3. 둘 다 없으면 → 닉네임 첫 글자로 이니셜 아바타 표시
 */

/**
 * 아바타 타입 정의
 */
export interface Avatar {
  /** 아바타 고유 ID (Firestore에 저장) */
  id: string;
  /** 아바타 이름 (한글) */
  name: string;
  /** 아바타 이미지 경로 (/public 기준) */
  path: string;
}

/**
 * 사용 가능한 아바타 목록
 *
 * 투자 관련 동물 테마:
 * - 황소(Bull): 상승장 상징
 * - 곰(Bear): 하락장 상징
 * - 기타 동물: 다양한 투자 성향 표현
 */
export const AVATARS: Avatar[] = [
  { id: 'bull', name: '황소', path: '/avatars/avatar-bull.png' },
  { id: 'bear', name: '곰', path: '/avatars/avatar-bear.png' },
  { id: 'lion', name: '사자', path: '/avatars/avatar-lion.png' },
  { id: 'tiger', name: '호랑이', path: '/avatars/avatar-tiger.png' },
  { id: 'fox', name: '여우', path: '/avatars/avatar-fox.png' },
  { id: 'eagle', name: '독수리', path: '/avatars/avatar-eagle.png' },
  { id: 'dragon', name: '용', path: '/avatars/avatar-dragon.png' },
  { id: 'shark', name: '상어', path: '/avatars/avatar-shark.png' },
  { id: 'dolphin', name: '돌고래', path: '/avatars/avatar-dolphin.png' },
  { id: 'owl', name: '부엉이', path: '/avatars/avatar-owl.png' },
];

/**
 * 기본 아바타 ID
 * 아바타를 선택하지 않은 경우 사용
 */
export const DEFAULT_AVATAR_ID = 'bull';

/**
 * 아바타 ID로 아바타 정보 찾기
 *
 * @param avatarId - 찾을 아바타 ID
 * @returns 아바타 객체 또는 undefined
 */
export const getAvatarById = (avatarId: string | undefined | null): Avatar | undefined => {
  if (!avatarId) return undefined;
  return AVATARS.find(a => a.id === avatarId);
};

/**
 * 아바타 ID로 이미지 경로 찾기
 *
 * @param avatarId - 아바타 ID
 * @returns 이미지 경로 (없으면 기본 아바타 경로 반환)
 *
 * @example
 * getAvatarPath('bull') // '/avatars/avatar-bull.png'
 * getAvatarPath(undefined) // '/avatars/avatar-bull.png' (기본값)
 */
export const getAvatarPath = (avatarId: string | undefined | null): string => {
  const avatar = getAvatarById(avatarId);
  return avatar?.path || AVATARS[0].path; // 기본값: 황소
};

/**
 * 아바타 ID가 유효한지 확인
 *
 * @param avatarId - 검사할 아바타 ID
 * @returns 유효하면 true, 아니면 false
 */
export const isValidAvatarId = (avatarId: string | undefined | null): boolean => {
  if (!avatarId) return false;
  return AVATARS.some(a => a.id === avatarId);
};
