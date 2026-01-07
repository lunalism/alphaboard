/**
 * 개별 가격 알림 API 라우트
 *
 * 특정 알림 수정 및 삭제 API
 *
 * 엔드포인트:
 * - PATCH /api/alerts/[id]: 알림 수정 (활성화/비활성화, 목표가 변경)
 * - DELETE /api/alerts/[id]: 알림 삭제
 *
 * 인증:
 * - Supabase 세션 기반 인증 (쿠키)
 * - RLS 정책으로 본인 데이터만 접근 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PriceAlertRow, rowToPriceAlert, UpdateAlertRequest } from '@/types/priceAlert';

/**
 * PATCH /api/alerts/[id]
 *
 * 특정 알림 수정
 * - 활성화/비활성화 토글
 * - 목표가 변경
 * - 알림 방향 변경
 *
 * @param request 요청 객체
 * @param params 경로 파라미터 (id: 알림 ID)
 * @returns 수정된 알림 또는 에러
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 경로 파라미터에서 알림 ID 추출
    const { id } = await params;

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
    const body: UpdateAlertRequest = await request.json();

    // 수정할 내용이 없는 경우
    if (
      body.isActive === undefined &&
      body.targetPrice === undefined &&
      body.direction === undefined
    ) {
      return NextResponse.json(
        { success: false, error: '수정할 내용이 없습니다' },
        { status: 400 }
      );
    }

    // 목표가 유효성 검증
    if (body.targetPrice !== undefined && body.targetPrice <= 0) {
      return NextResponse.json(
        { success: false, error: '목표가는 0보다 커야 합니다' },
        { status: 400 }
      );
    }

    // 방향 유효성 검증
    if (body.direction !== undefined && !['above', 'below'].includes(body.direction)) {
      return NextResponse.json(
        { success: false, error: '잘못된 알림 방향입니다' },
        { status: 400 }
      );
    }

    // 업데이트 데이터 구성 (snake_case로 변환)
    const updateData: Record<string, unknown> = {};
    if (body.isActive !== undefined) {
      updateData.is_active = body.isActive;
    }
    if (body.targetPrice !== undefined) {
      updateData.target_price = body.targetPrice;
      // 목표가 변경 시 트리거 상태 초기화
      updateData.is_triggered = false;
      updateData.triggered_at = null;
    }
    if (body.direction !== undefined) {
      updateData.direction = body.direction;
    }

    // 알림 수정
    // RLS 정책으로 본인 알림만 수정 가능
    const { data, error } = await supabase
      .from('price_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // DB 에러 체크
    if (error) {
      console.error('알림 수정 에러:', error);

      // 알림을 찾을 수 없는 경우
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: '알림을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: '알림 수정에 실패했습니다' },
        { status: 500 }
      );
    }

    // 수정된 알림 반환
    const alert = rowToPriceAlert(data as PriceAlertRow);

    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('알림 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/[id]
 *
 * 특정 알림 삭제
 *
 * @param request 요청 객체
 * @param params 경로 파라미터 (id: 알림 ID)
 * @returns 성공 여부 또는 에러
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 경로 파라미터에서 알림 ID 추출
    const { id } = await params;

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

    // 알림 삭제
    // RLS 정책으로 본인 알림만 삭제 가능
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id);

    // DB 에러 체크
    if (error) {
      console.error('알림 삭제 에러:', error);
      return NextResponse.json(
        { success: false, error: '알림 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('알림 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
