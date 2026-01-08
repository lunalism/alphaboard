import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // 리다이렉트 응답 준비
  const redirectUrl = code ? `${origin}${next}` : `${origin}/login?error=no_code`

  if (code) {
    // 쿠키를 응답에 설정하기 위한 변수
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            // 나중에 응답에 설정하기 위해 저장
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // 응답 생성 후 쿠키 설정
    const response = NextResponse.redirect(
      error ? `${origin}/login?error=${encodeURIComponent(error.message)}` : redirectUrl
    )

    // 쿠키를 응답에 추가
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error.message)
    } else {
      console.log('[Auth Callback] Session exchanged successfully, cookies set:', cookiesToSet.length)
    }

    return response
  }

  // code가 없는 경우
  return NextResponse.redirect(redirectUrl)
}
