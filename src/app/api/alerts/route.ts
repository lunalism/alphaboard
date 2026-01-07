/**
 * 가격 알림 API 라우트
 *
 * 가격 알림 목록 조회 및 새 알림 추가 API
 *
 * 엔드포인트:
 * - GET /api/alerts: 내 알림 목록 조회
 * - POST /api/alerts: 새 알림 추가
 *
 * 인증:
 * - Supabase 세션 기반 인증 (쿠키)
 * - RLS 정책으로 본인 데이터만 접근 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  PriceAlertRow,
  rowToPriceAlert,
  CreateAlertRequest,
  AlertMarket,
  AlertDirection,
} from '@/types/priceAlert';

/**
 * GET /api/alerts
 *
 * 현재 로그인한 사용자의 가격 알림 목록 조회
 * RLS 정책으로 자동으로 본인 데이터만 조회됨
 *
 * @returns 알림 목록 또는 에러
 */
export async function GET() {
  try {
    // Supabase 클라이언트 생성 (서버 사이드)
    const supabase = await createClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 인증 에러 체크
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 알림 목록 조회 (최신순 정렬)
    // RLS 정책으로 user_id = auth.uid() 조건이 자동 적용됨
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    // DB 에러 체크
    if (error) {
      console.error('알림 조회 에러:', error);
      return NextResponse.json(
        { success: false, error: '알림 목록을 불러오는데 실패했습니다' },
        { status: 500 }
      );
    }

    // snake_case -> camelCase 변환
    const alerts = (data as PriceAlertRow[]).map(rowToPriceAlert);

    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('알림 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 *
 * 새 가격 알림 추가
 *
 * @param request 요청 객체 (본문에 알림 정보 포함)
 * @returns 생성된 알림 또는 에러
 */
export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 인증 에러 체크
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body: CreateAlertRequest = await request.json();

    // 필수 필드 검증
    if (!body.ticker || !body.market || !body.stockName || !body.targetPrice || !body.direction) {
      return NextResponse.json(
        { success: false, error: '필수 항목이 누락되었습니다' },
        { status: 400 }
      );
    }

    // 시장 유효성 검증
    if (!['KR', 'US'].includes(body.market)) {
      return NextResponse.json(
        { success: false, error: '잘못된 시장 구분입니다' },
        { status: 400 }
      );
    }

    // 방향 유효성 검증
    if (!['above', 'below'].includes(body.direction)) {
      return NextResponse.json(
        { success: false, error: '잘못된 알림 방향입니다' },
        { status: 400 }
      );
    }

    // 목표가 유효성 검증
    if (body.targetPrice <= 0) {
      return NextResponse.json(
        { success: false, error: '목표가는 0보다 커야 합니다' },
        { status: 400 }
      );
    }

    // 알림 추가
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user.id,
        ticker: body.ticker,
        market: body.market as AlertMarket,
        stock_name: body.stockName,
        target_price: body.targetPrice,
        direction: body.direction as AlertDirection,
        is_active: true,
        is_triggered: false,
      })
      .select()
      .single();

    // DB 에러 체크
    if (error) {
      console.error('알림 추가 에러:', error);
      return NextResponse.json(
        { success: false, error: '알림 추가에 실패했습니다' },
        { status: 500 }
      );
    }

    // 생성된 알림 반환
    const alert = rowToPriceAlert(data as PriceAlertRow);

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (error) {
    console.error('알림 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
