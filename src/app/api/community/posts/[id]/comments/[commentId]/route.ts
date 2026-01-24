/**
 * 개별 댓글 API (Firestore)
 *
 * PATCH /api/community/posts/[id]/comments/[commentId] - 댓글 수정
 * DELETE /api/community/posts/[id]/comments/[commentId] - 댓글 삭제
 *
 * 작성 후 1시간 이내에만 수정/삭제 가능
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  postDoc,
  commentDoc,
  getDocument,
  updateDocument,
  deleteDocument,
  timestampToString,
  type FirestorePost,
  type FirestoreComment,
} from '@/lib/firestore';
import { CommunityComment, CommunityApiResponse } from '@/types/community';
import { updateDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';

interface RouteParams {
  params: Promise<{ id: string; commentId: string }>;
}

// 1시간 제한 (밀리초)
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Firestore 문서를 CommunityComment로 변환
 */
function docToComment(
  doc: FirestoreComment & { id: string },
  postId: string
): CommunityComment {
  return {
    id: doc.id,
    postId,
    userId: doc.userId,
    content: doc.content,
    createdAt: timestampToString(doc.createdAt),
    author: {
      id: doc.userId,
      name: doc.authorName || '사용자',
      handle: doc.authorHandle || doc.userId.slice(0, 8),
      avatarUrl: doc.authorPhotoURL || null,
    },
  };
}

/**
 * 수정/삭제 가능 여부 확인 (1시간 이내)
 * @param createdAt 생성 시간 (Firestore Timestamp 또는 ISO string)
 * @returns true면 수정/삭제 가능
 */
function canEditOrDelete(createdAt: unknown): boolean {
  let createdTime: number;

  // Firestore Timestamp 객체인 경우
  if (createdAt && typeof createdAt === 'object' && 'toMillis' in createdAt) {
    createdTime = (createdAt as { toMillis: () => number }).toMillis();
  } else if (typeof createdAt === 'string') {
    // ISO string인 경우
    createdTime = new Date(createdAt).getTime();
  } else {
    // 알 수 없는 형식이면 수정 불가로 처리
    return false;
  }

  const now = Date.now();
  return now - createdTime < ONE_HOUR_MS;
}

/**
 * PATCH /api/community/posts/[id]/comments/[commentId]
 * 댓글 수정 (본인만 가능, 1시간 이내)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: postId, commentId } = await params;

    // 요청 헤더에서 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 게시글 존재 확인
    const post = await getDocument<FirestorePost>(postDoc(postId));
    if (!post) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 댓글 조회
    const comment = await getDocument<FirestoreComment>(commentDoc(postId, commentId));
    if (!comment) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인 확인
    if (comment.userId !== userId) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글 수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 1시간 제한 확인
    if (!canEditOrDelete(comment.createdAt)) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '작성 후 1시간이 지나 수정할 수 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (content.length > 300) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글은 300자를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Firestore 문서 업데이트
    await updateDocument(commentDoc(postId, commentId), {
      content: content.trim(),
    });

    // 업데이트된 댓글 조회
    const updatedComment = await getDocument<FirestoreComment>(commentDoc(postId, commentId));
    if (!updatedComment) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    const commentData = docToComment(updatedComment, postId);

    return NextResponse.json<CommunityApiResponse<CommunityComment>>({
      success: true,
      data: commentData,
    });
  } catch (error) {
    console.error('[Comment API] 댓글 수정 에러:', error);
    return NextResponse.json<CommunityApiResponse<null>>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/community/posts/[id]/comments/[commentId]
 * 댓글 삭제 (본인만 가능, 1시간 이내)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: postId, commentId } = await params;

    // 요청 헤더에서 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 게시글 존재 확인
    const post = await getDocument<FirestorePost>(postDoc(postId));
    if (!post) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 댓글 조회
    const comment = await getDocument<FirestoreComment>(commentDoc(postId, commentId));
    if (!comment) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인 확인
    if (comment.userId !== userId) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '댓글 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 1시간 제한 확인
    if (!canEditOrDelete(comment.createdAt)) {
      return NextResponse.json<CommunityApiResponse<null>>(
        { success: false, error: '작성 후 1시간이 지나 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    // Firestore 문서 삭제
    await deleteDocument(commentDoc(postId, commentId));

    // 게시글의 commentsCount 감소
    await updateDoc(postDoc(postId), {
      commentsCount: increment(-1),
    });

    return NextResponse.json<CommunityApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('[Comment API] 댓글 삭제 에러:', error);
    return NextResponse.json<CommunityApiResponse<null>>(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
