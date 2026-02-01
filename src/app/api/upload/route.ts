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
 *   path: "tickerbird/announcements/...",
 *   filename: "original-filename.jpg"
 * }
 *
 * 실패 (400/500):
 * {
 *   success: false,
 *   error: "에러 메시지"
 * }
 */

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
 * SDK 대신 fetch API를 사용하여 안정성 향상
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // 1. 환경 변수 확인
    // ========================================
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary 설정이 없습니다. 관리자에게 문의해주세요.',
        },
        { status: 500 }
      );
    }

    // ========================================
    // 2. FormData 파싱
    // ========================================
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentType = (formData.get('contentType') as ContentType) || 'general';

    // 파일 존재 확인
    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 첨부되지 않았습니다.' },
        { status: 400 }
      );
    }

    // ========================================
    // 3. 파일 검증
    // ========================================

    // MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
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
      return NextResponse.json(
        {
          success: false,
          error: `파일 크기가 너무 큽니다. (${sizeMB}MB / 최대 4MB)`,
        },
        { status: 400 }
      );
    }

    // ========================================
    // 4. 업로드 준비
    // ========================================
    const folder = `tickerbird/${contentType}`;
    const originalFilename = file.name || 'image';
    const safeFilename = originalFilename
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '_')
      .slice(0, 50);
    const publicId = `${folder}/${Date.now()}_${safeFilename}`;

    // ========================================
    // 5. File을 base64로 변환
    // ========================================
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // ========================================
    // 6. Cloudinary Upload API 직접 호출
    // ========================================
    const timestamp = Math.round(Date.now() / 1000);

    // 서명 생성
    const crypto = await import('crypto');
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    // FormData 생성
    const uploadFormData = new FormData();
    uploadFormData.append('file', base64Data);
    uploadFormData.append('public_id', publicId);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('signature', signature);

    // Cloudinary API 호출
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || '이미지 업로드에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // ========================================
    // 7. 성공 응답
    // ========================================
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      path: result.public_id,
      filename: originalFilename,
    });
  } catch (error: unknown) {
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
