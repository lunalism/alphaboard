/**
 * useSiteContent - 사이트 콘텐츠 (개인정보처리방침, 이용약관) 관리 훅
 *
 * Firestore siteContent 컬렉션에서 콘텐츠를 조회하고 수정합니다.
 *
 * 주요 기능:
 * - 콘텐츠 조회 (privacy, terms)
 * - 콘텐츠 수정 (관리자 전용)
 * - 기본 템플릿 제공
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteContent, SiteContentType } from '@/types/admin';

// ============================================
// 기본 템플릿 (초기값)
// ============================================

/** 개인정보처리방침 기본 템플릿 */
const DEFAULT_PRIVACY_CONTENT = `# 개인정보처리방침

**시행일: 2026년 1월 1일**

AlphaBoard(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.

## 1. 수집하는 개인정보 항목

회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:

### 필수 수집 항목
- **이메일 주소**: 계정 식별 및 로그인
- **Google 프로필 정보**: 이름, 프로필 사진 (Google 로그인 시)

### 자동 수집 항목
- 서비스 이용 기록, 접속 로그, 쿠키
- 기기 정보 (브라우저 종류, OS 등)

## 2. 개인정보의 수집 및 이용 목적

- 회원 가입 및 관리
- 서비스 제공 및 개선
- 맞춤형 서비스 제공
- 고객 문의 응대

## 3. 개인정보의 보유 및 이용 기간

회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.
단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.

## 4. 개인정보의 제3자 제공

회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
다만, 법령에 의한 요청이 있는 경우 예외로 합니다.

## 5. 개인정보의 파기 절차 및 방법

- 전자적 파일: 복구 불가능한 방법으로 영구 삭제
- 서면 자료: 분쇄 또는 소각

## 6. 이용자의 권리

이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.
프로필 페이지에서 직접 수정하거나, 고객센터로 문의하시기 바랍니다.

## 7. 개인정보 보호책임자

- 이메일: privacy@alphaboard.com

## 8. 개인정보처리방침의 변경

본 방침은 시행일로부터 적용되며, 변경 시 웹사이트를 통해 공지합니다.
`;

/** 이용약관 기본 템플릿 */
const DEFAULT_TERMS_CONTENT = `# 서비스 이용약관

**시행일: 2026년 1월 1일**

## 제1조 (목적)

본 약관은 AlphaBoard(이하 "회사")가 제공하는 서비스의 이용 조건 및 절차,
회사와 이용자의 권리, 의무, 책임사항 등을 규정함을 목적으로 합니다.

## 제2조 (정의)

1. "서비스"란 회사가 제공하는 글로벌 투자 정보 플랫폼을 의미합니다.
2. "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.
3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자를 의미합니다.

## 제3조 (약관의 효력 및 변경)

1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
2. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다.
3. 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.

## 제4조 (서비스의 제공)

회사는 다음과 같은 서비스를 제공합니다:

1. 실시간 주식 시세 정보
2. 경제 뉴스 및 분석
3. 관심종목 관리
4. 가격 알림
5. 커뮤니티 서비스
6. 기타 회사가 정하는 서비스

## 제5조 (서비스의 중단)

1. 회사는 시스템 점검, 설비 교체 등 부득이한 사유가 있는 경우 서비스를 일시 중단할 수 있습니다.
2. 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단에 대해 회사는 책임을 지지 않습니다.

## 제6조 (회원가입)

1. 이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의함으로써 회원가입을 신청합니다.
2. 회사는 다음에 해당하는 경우 회원가입을 거절할 수 있습니다:
   - 타인의 명의를 사용한 경우
   - 허위 정보를 기재한 경우
   - 기타 회사가 정한 이용신청 요건이 충족되지 않은 경우

## 제7조 (회원 탈퇴 및 자격 상실)

1. 회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.
2. 회원이 다음 행위를 한 경우 자격을 상실시킬 수 있습니다:
   - 가입 시 허위 내용을 등록한 경우
   - 다른 사람의 서비스 이용을 방해한 경우
   - 법령 또는 본 약관을 위반한 경우

## 제8조 (이용자의 의무)

이용자는 다음 행위를 하여서는 안 됩니다:

1. 타인의 정보 도용
2. 서비스의 정상적 운영 방해
3. 음란, 폭력적 내용 게시
4. 영리 목적의 광고 게시 (승인 없이)
5. 기타 관계 법령에 위반되는 행위

## 제9조 (저작권의 귀속)

1. 회사가 작성한 저작물의 저작권은 회사에 귀속됩니다.
2. 이용자가 작성한 게시물의 저작권은 해당 이용자에게 귀속됩니다.

## 제10조 (면책조항)

1. 회사는 무료로 제공하는 서비스에 관하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.
2. 회사가 제공하는 투자 정보는 참고용이며, 투자 결정에 대한 책임은 이용자 본인에게 있습니다.

## 제11조 (분쟁 해결)

서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 원만한 해결을 위해 성실히 협의합니다.

## 부칙

본 약관은 2026년 1월 1일부터 시행합니다.
`;

/** 기본 템플릿 가져오기 */
const getDefaultContent = (type: SiteContentType): string => {
  return type === 'privacy' ? DEFAULT_PRIVACY_CONTENT : DEFAULT_TERMS_CONTENT;
};

/** 기본 제목 가져오기 */
const getDefaultTitle = (type: SiteContentType): string => {
  return type === 'privacy' ? '개인정보처리방침' : '서비스 이용약관';
};

// ============================================
// 훅 타입 정의
// ============================================

/** useSiteContent 훅 반환 타입 */
interface UseSiteContentReturn {
  // 콘텐츠 데이터
  content: SiteContent | null;
  // 로딩 상태
  isLoading: boolean;
  // 저장 중 상태
  isSaving: boolean;
  // 에러 메시지
  error: string | null;
  // 콘텐츠 저장
  saveContent: (title: string, content: string, updatedBy: string) => Promise<void>;
  // 콘텐츠 새로고침
  refreshContent: () => Promise<void>;
}

// ============================================
// 훅 구현
// ============================================

/**
 * 사이트 콘텐츠 조회/수정 훅
 *
 * @param type - 콘텐츠 타입 (privacy 또는 terms)
 *
 * @example
 * // 개인정보처리방침 조회
 * const { content, isLoading, saveContent } = useSiteContent('privacy');
 *
 * // 콘텐츠 저장
 * await saveContent('개인정보처리방침', '# 내용...', 'admin@example.com');
 */
export function useSiteContent(type: SiteContentType): UseSiteContentReturn {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Firestore에서 콘텐츠 조회
   */
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const contentRef = doc(db, 'siteContent', type);
      const contentDoc = await getDoc(contentRef);

      if (contentDoc.exists()) {
        // 기존 콘텐츠 반환
        const data = contentDoc.data() as Omit<SiteContent, 'id'>;
        setContent({
          id: type,
          title: data.title,
          content: data.content,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      } else {
        // 문서가 없으면 기본 템플릿으로 초기화
        const defaultContent: Omit<SiteContent, 'id'> = {
          title: getDefaultTitle(type),
          content: getDefaultContent(type),
          updatedAt: Timestamp.now(),
          updatedBy: 'system',
        };

        // Firestore에 기본 템플릿 저장
        await setDoc(contentRef, defaultContent);

        setContent({
          id: type,
          ...defaultContent,
        });
      }
    } catch (err) {
      console.error(`[useSiteContent] ${type} 콘텐츠 조회 에러:`, err);
      setError('콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // 컴포넌트 마운트 시 콘텐츠 조회
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  /**
   * 콘텐츠 저장
   *
   * @param title - 제목
   * @param contentText - 본문 (Markdown)
   * @param updatedBy - 수정한 관리자 이메일
   */
  const saveContent = useCallback(
    async (title: string, contentText: string, updatedBy: string) => {
      try {
        setIsSaving(true);
        setError(null);

        const contentRef = doc(db, 'siteContent', type);
        const updateData: Omit<SiteContent, 'id'> = {
          title,
          content: contentText,
          updatedAt: serverTimestamp() as Timestamp,
          updatedBy,
        };

        await setDoc(contentRef, updateData, { merge: true });

        // 로컬 상태 업데이트
        setContent({
          id: type,
          title,
          content: contentText,
          updatedAt: Timestamp.now(),
          updatedBy,
        });
      } catch (err) {
        console.error(`[useSiteContent] ${type} 콘텐츠 저장 에러:`, err);
        setError('콘텐츠 저장에 실패했습니다.');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [type]
  );

  return {
    content,
    isLoading,
    isSaving,
    error,
    saveContent,
    refreshContent: fetchContent,
  };
}

export default useSiteContent;
