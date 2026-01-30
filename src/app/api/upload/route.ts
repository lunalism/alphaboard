/**
 * 이미지 업로드 API Route (Cloudinary)
 *
 * 클라이언트에서 이미지를 받아 Cloudinary에 업로드합니다.
 * 서버사이드에서 처리하므로 CORS 문제가 발생하지 않습니다.
 *
 * ============================================================
 * Cloudinary 무료 플랜:
 * ============================================================
 * - 25GB 저장 공간
 * - 25GB 대역폭/월
 * - 이미지 자동 최적화
 * - CDN 제공
 *
 * ============================================================
 * 엔드포인트:
 * ============================================================
 * POST /api/upload
 *
 * ============================================================
 * 요청 형식:
 * ============================================================
 * Content-Type: multipart/form-data
 * Body:
 *   - file: 이미지 파일 (필수)
 *   - contentType: 'announcements' | 'faq' | 'general' (선택, 기본: 'general')
 *
 * ============================================================
 * 응답 형식:
 * ============================================================
 * 성공 (200):
 * {
 *   success: true,
 *   url: "https://res.cloudinary.com/...",
 *   path: "alphaboard/announcements/...",
 *   filename: "original-filename.jpg"
 * }
 *
 * 실패 (400/500):
 * {
 *   success: false,
 *   error: "에러 메시지"
 * }
 */

import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// ==================== 상수 ====================

/** 허용되는 이미지 MIME 타입 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/** 최대 파일 크기 (4MB - Vercel 서버리스 함수 제한 고려) */
const MAX_FILE_SIZE = 4 * 1024 * 1024;

/** 컨텐츠 타입 */
type ContentType = 'announcements' | 'faq' | 'general';

// ==================== API Handler ====================

/**
 * POST /api/upload
 *
 * 이미지 파일을 Cloudinary에 업로드합니다.
 */
export async function POST(request: NextRequest) {
  console.log('[API/upload] POST 요청 수신');

  try {
    // ========================================
    // 1. Cloudinary 설정 (함수 내부에서 설정)
    // ========================================
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('[API/upload] 환경 변수 확인:', {
      cloudName: cloudName ? '설정됨' : '미설정',
      apiKey: apiKey ? '설정됨' : '미설정',
      apiSecret: apiSecret ? '설정됨' : '미설정',
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[API/upload] Cloudinary 환경 변수 누락');
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary 설정이 없습니다. 관리자에게 문의해주세요.',
        },
        { status: 500 }
      );
    }

    // Cloudinary 설정 (요청마다 설정)
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // ========================================
    // 2. FormData 파싱
    // ========================================
    console.log('[API/upload] FormData 파싱 시작');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentType = (formData.get('contentType') as ContentType) || 'general';

    // 파일 존재 확인
    if (!file) {
      console.error('[API/upload] 파일 없음');
      return NextResponse.json(
        { success: false, error: '파일이 첨부되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('[API/upload] 파일 정보:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // ========================================
    // 3. 파일 검증
    // ========================================

    // MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error('[API/upload] 지원하지 않는 MIME 타입:', file.type);
      return NextResponse.json(
        {
          success: false,
          error: `지원하지 않는 이미지 형식입니다. (지원: JPG, PNG, GIF, WebP, SVG)`,
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      console.error('[API/upload] 파일 크기 초과:', sizeMB, 'MB');
      return NextResponse.json(
        {
          success: false,
          error: `파일 크기가 너무 큽니다. (${sizeMB}MB / 최대 4MB)`,
        },
        { status: 400 }
      );
    }

    // ========================================
    // 4. Cloudinary 폴더 경로 설정
    // ========================================
    const folder = `alphaboard/${contentType}`;
    const originalFilename = file.name || 'image';
    // 파일명에서 특수문자 제거
    const safeFilename = originalFilename
      .replace(/\.[^/.]+$/, '') // 확장자 제거
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '_') // 특수문자를 _로 대체
      .slice(0, 50); // 최대 50자

    console.log('[API/upload] 업로드 준비:', {
      folder,
      safeFilename,
      contentType,
    });

    // ========================================
    // 5. File을 base64로 변환
    // ========================================
    console.log('[API/upload] base64 변환 시작');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    console.log('[API/upload] base64 변환 완료, 길이:', base64.length);

    // ========================================
    // 6. Cloudinary에 업로드
    // ========================================
    console.log('[API/upload] Cloudinary 업로드 시작');

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      public_id: `${Date.now()}_${safeFilename}`,
      resource_type: 'image',
      // transformation 제거 (문제 가능성)
    });

    console.log('[API/upload] Cloudinary 업로드 완료:', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });

    // ========================================
    // 7. 성공 응답
    // ========================================
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      path: result.public_id,
      filename: originalFilename,
    });
  } catch (error) {
    // 상세 에러 로깅
    console.error('[API/upload] 업로드 오류 발생');
    console.error('[API/upload] 에러 타입:', typeof error);
    console.error('[API/upload] 에러 객체:', error);

    if (error instanceof Error) {
      console.error('[API/upload] 에러 메시지:', error.message);
      console.error('[API/upload] 에러 스택:', error.stack);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: `이미지 업로드 중 오류가 발생했습니다: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 *
 * API 상태 확인용 (헬스 체크)
 */
export async function GET() {
  const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    status: 'ok',
    provider: 'cloudinary',
    configured: isConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'not set',
  });
}
