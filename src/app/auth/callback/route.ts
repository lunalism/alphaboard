import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error.message)
      const response = NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }


    // 신규 사용자 체크: profiles 테이블에서 name 확인
    let redirectTo = next
    if (data.session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.session.user.id)
        .single()

      const isNewUser = !profile || !profile.name

      if (isNewUser) {
        redirectTo = '/onboarding'
      }
    }

    // 응답 생성 후 쿠키 설정
    const response = NextResponse.redirect(`${origin}${redirectTo}`)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // code가 없는 경우
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
