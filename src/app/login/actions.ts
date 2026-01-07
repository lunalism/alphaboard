'use server'

/**
 * 로그인 관련 Server Actions
 *
 * Next.js Server Actions를 사용하여 서버에서 Supabase 인증 처리
 * 클라이언트에서 직접 Supabase를 호출하지 않고 서버를 통해 인증
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 테스트 로그인용 상수
 * 개발 환경에서 테스트 모드 로그인에 사용
 */
const TEST_USER_EMAIL = 'test@alphaboard.dev'
const TEST_USER_PASSWORD = 'test1234!@#$'

/**
 * Google OAuth 로그인
 *
 * Google 계정으로 로그인하기 위해 OAuth URL로 리다이렉트
 * 로그인 성공 시 /auth/callback으로 돌아옴
 */
export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    redirect('/login?error=Could not authenticate user')
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * 로그아웃
 *
 * Supabase 세션을 종료하고 로그인 페이지로 리다이렉트
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * 테스트 모드 로그인 결과 타입
 */
interface TestLoginResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

/**
 * 테스트 모드 로그인
 *
 * 개발/테스트용 계정으로 Supabase에 로그인
 * 계정이 없으면 자동으로 생성 (signUp)
 *
 * 사용 시나리오:
 * 1. 테스트 모드 토글 ON 시 호출
 * 2. 기존 테스트 계정으로 로그인 시도
 * 3. 계정이 없으면 새로 생성 후 로그인
 * 4. 로그인 성공 시 사용자 정보 반환
 *
 * @returns 로그인 결과 (성공 시 사용자 정보, 실패 시 에러 메시지)
 */
export async function testSignIn(): Promise<TestLoginResult> {
  const supabase = await createClient()

  // 1. 먼저 기존 계정으로 로그인 시도
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  })

  // 로그인 성공
  if (signInData?.user) {
    return {
      success: true,
      user: {
        id: signInData.user.id,
        email: signInData.user.email || TEST_USER_EMAIL,
        name: '테스트 사용자',
      },
    }
  }

  // 2. 로그인 실패 시 (계정이 없거나 비밀번호 틀림) 회원가입 시도
  console.log('Test login failed, attempting signup...', signInError?.message)

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    options: {
      // 이메일 확인 없이 바로 활성화 (개발 환경)
      data: {
        full_name: '테스트 사용자',
        name: '테스트 사용자',
      },
    },
  })

  // 회원가입 성공
  if (signUpData?.user) {
    return {
      success: true,
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email || TEST_USER_EMAIL,
        name: '테스트 사용자',
      },
    }
  }

  // 3. 모두 실패
  console.error('Test signup failed:', signUpError?.message)
  return {
    success: false,
    error: signUpError?.message || signInError?.message || '테스트 로그인에 실패했습니다',
  }
}

/**
 * 테스트 모드 로그아웃
 *
 * 테스트 세션 종료 (리다이렉트 없음)
 * 클라이언트에서 상태 초기화 후 호출
 */
export async function testSignOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
