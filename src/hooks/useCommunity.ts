/**
 * 커뮤니티 훅
 *
 * 게시글 CRUD, 좋아요, 댓글 기능을 관리합니다.
 * Firebase Auth 연동을 위해 useAuth() 훅 사용
 */
import { useState, useCallback, useEffect } from 'react';
import {
  CommunityPost,
  CommunityComment,
  CommunityCategory,
  SortType,
  CreatePostRequest,
  CreateCommentRequest,
  CommunityApiResponse,
  PostsListResponse,
} from '@/types/community';
import { useAuth } from '@/components/providers/AuthProvider';

interface UseCommunityOptions {
  category?: CommunityCategory;
  sort?: SortType;
  /** 종목 필터 (특정 종목 태그가 있는 글만 조회) */
  ticker?: string;
  autoFetch?: boolean;
}

interface CommentsListResponse {
  comments: CommunityComment[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 커뮤니티 게시글 관리 훅
 *
 * useAuth() 훅을 사용하여 Firebase Auth 사용자 정보를 가져옴
 * API 호출 시 x-user-id, x-user-name, x-user-photo 헤더에 사용자 정보 전달
 */
export function useCommunity(options: UseCommunityOptions = {}) {
  const { category = 'all', sort = 'latest', ticker, autoFetch = true } = options;

  // AuthProvider의 useAuth 훅으로 사용자 정보 가져오기
  // user: Firebase Auth User 객체 (uid 포함)
  // userProfile: 앱 내부 프로필 (nickname, avatarUrl 포함)
  const { user, userProfile } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  /**
   * API 요청 시 사용할 인증 헤더 생성
   * Firebase Auth 사용자 정보를 헤더에 포함
   *
   * 사용자 이름(닉네임) 우선순위:
   * 1. userProfile.nickname (AlphaBoard 닉네임)
   * 2. userProfile.displayName (프로필에서 가져온 이름)
   * 3. user.displayName (Firebase Auth의 Google 이름)
   * 4. user.email의 @ 앞부분
   * 5. '사용자' (기본값)
   *
   * 사용자 핸들(@아이디) - 고유 식별자:
   * 1. user.email의 @ 앞부분
   * 2. user.uid 앞 8자리 (이메일 없는 경우)
   *
   * 프로필 이미지 우선순위:
   * 1. userProfile.avatarUrl
   * 2. user.photoURL (Firebase Auth의 Google 프로필 사진)
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 로그인된 사용자인 경우 헤더에 사용자 정보 추가
    if (user?.uid) {
      headers['x-user-id'] = user.uid;

      // 사용자 이름(닉네임) 설정 - 표시용
      // nickname이 빈 문자열('')인 경우도 falsy로 처리됨
      const userName =
        (userProfile?.nickname && userProfile.nickname.trim()) ||
        (userProfile?.displayName && userProfile.displayName.trim()) ||
        user.displayName ||
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        '사용자';
      headers['x-user-name'] = encodeURIComponent(userName);

      // 사용자 핸들(@아이디) 설정 - 고유 식별자
      // 우선순위:
      // 1. userProfile.email 앞부분 (Firestore에서 가져온 이메일)
      // 2. user.email 앞부분 (Firebase Auth - fallback)
      // 3. user.uid 앞 8자리 (최후 fallback)
      const userHandle =
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        user.uid.slice(0, 8);
      headers['x-user-handle'] = encodeURIComponent(userHandle);

      // 프로필 이미지 설정 (userProfile → user.photoURL 순서)
      const photoUrl = userProfile?.avatarUrl || user.photoURL;
      if (photoUrl) {
        headers['x-user-photo'] = encodeURIComponent(photoUrl);
      }
    }

    return headers;
  }, [user, userProfile]);

  /**
   * 게시글 목록 조회
   *
   * 로그인 사용자인 경우 인증 헤더 포함 (좋아요 여부 확인용)
   * ticker가 설정된 경우 해당 종목이 태그된 글만 조회
   */
  const fetchPosts = useCallback(async (reset: boolean = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        category,
        sort,
        limit: '20',
      });

      // 종목 필터 추가 (특정 종목 태그가 있는 글만 조회)
      if (ticker) {
        params.set('ticker', ticker);
      }

      if (!reset && nextCursor) {
        params.set('cursor', nextCursor);
      }

      // 인증 헤더 포함 (좋아요 여부 확인용)
      const response = await fetch(`/api/community/posts?${params}`, {
        headers: getAuthHeaders(),
      });
      const result: CommunityApiResponse<PostsListResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '게시글을 불러오는데 실패했습니다.');
      }

      const { posts: newPosts, hasMore: more, nextCursor: cursor } = result.data;

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(more);
      setNextCursor(cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [category, sort, ticker, nextCursor, getAuthHeaders]);

  /**
   * 더 많은 게시글 로드 (무한 스크롤)
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPosts(false);
    }
  }, [isLoading, hasMore, fetchPosts]);

  /**
   * 게시글 새로고침
   */
  const refetch = useCallback(() => {
    setNextCursor(undefined);
    fetchPosts(true);
  }, [fetchPosts]);

  /**
   * 새 게시글 작성
   *
   * getAuthHeaders()로 사용자 정보를 헤더에 포함하여 API 호출
   * 로그인되지 않은 경우 API에서 401 에러 반환
   *
   * @throws Error 게시글 작성 실패 시 에러 throw
   */
  const createPost = useCallback(async (data: CreatePostRequest): Promise<CommunityPost> => {
    // 인증 헤더 포함하여 API 호출
    const response = await fetch('/api/community/posts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result: CommunityApiResponse<CommunityPost> = await response.json();

    if (!result.success || !result.data) {
      const errorMsg = result.error || '게시글 작성에 실패했습니다.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // 에러 상태 초기화
    setError(null);

    // 새 게시글을 목록 맨 앞에 추가
    setPosts(prev => [result.data!, ...prev]);

    return result.data;
  }, [getAuthHeaders]);

  /**
   * 게시글 삭제
   *
   * 인증 헤더 포함하여 API 호출 (본인 게시글만 삭제 가능)
   */
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result: CommunityApiResponse<{ deleted: boolean }> = await response.json();

      if (!result.success) {
        throw new Error(result.error || '게시글 삭제에 실패했습니다.');
      }

      // 목록에서 제거
      setPosts(prev => prev.filter(p => p.id !== postId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 삭제에 실패했습니다.');
      return false;
    }
  }, [getAuthHeaders]);

  /**
   * 좋아요 토글
   *
   * 인증 헤더 포함하여 API 호출 (로그인 필요)
   */
  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result: CommunityApiResponse<{ liked: boolean; likesCount: number }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '좋아요 처리에 실패했습니다.');
      }

      // 게시글 목록에서 좋아요 상태 업데이트
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: result.data!.liked,
                likesCount: result.data!.likesCount,
              }
            : post
        )
      );

      return result.data.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : '좋아요 처리에 실패했습니다.');
      return false;
    }
  }, [getAuthHeaders]);

  /**
   * 카테고리, 정렬, 종목 필터가 변경되면 다시 로드
   *
   * fetchPosts를 의존성 배열에 포함하지 않는 이유:
   * - fetchPosts는 nextCursor에 의존하므로 매 렌더링마다 새로 생성됨
   * - 이 useEffect는 category/sort/ticker 변경 시에만 reset=true로 호출해야 함
   * - reset=true일 때 nextCursor는 사용되지 않으므로 의존성 불필요
   */
  useEffect(() => {
    if (autoFetch) {
      setNextCursor(undefined);
      fetchPosts(true);
    }
  // fetchPosts는 nextCursor 의존성으로 인해 안정적이지 않음 - 의도적 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, ticker, autoFetch]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    fetchPosts,
    loadMore,
    refetch,
    createPost,
    deletePost,
    toggleLike,
  };
}

/**
 * 게시글 댓글 관리 훅
 *
 * useAuth() 훅을 사용하여 Firebase Auth 사용자 정보를 가져옴
 * 댓글 작성 시 인증 헤더 포함
 */
export function useComments(postId: string) {
  // AuthProvider의 useAuth 훅으로 사용자 정보 가져오기
  const { user, userProfile } = useAuth();

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  /**
   * API 요청 시 사용할 인증 헤더 생성
   * (useCommunity의 getAuthHeaders와 동일한 로직)
   *
   * 헤더 정보:
   * - x-user-id: Firebase uid
   * - x-user-name: 닉네임 (표시용)
   * - x-user-handle: 핸들 (@아이디, 고유 식별자)
   * - x-user-photo: 프로필 이미지 URL
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (user?.uid) {
      headers['x-user-id'] = user.uid;

      // 사용자 이름(닉네임) 설정 - 표시용
      const userName =
        (userProfile?.nickname && userProfile.nickname.trim()) ||
        (userProfile?.displayName && userProfile.displayName.trim()) ||
        user.displayName ||
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        '사용자';
      headers['x-user-name'] = encodeURIComponent(userName);

      // 사용자 핸들(@아이디) 설정 - 고유 식별자
      // 우선순위:
      // 1. userProfile.email 앞부분 (Firestore에서 가져온 이메일)
      // 2. user.email 앞부분 (Firebase Auth - fallback)
      // 3. user.uid 앞 8자리 (최후 fallback)
      const userHandle =
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        user.uid.slice(0, 8);
      headers['x-user-handle'] = encodeURIComponent(userHandle);

      // 프로필 이미지 설정
      const photoUrl = userProfile?.avatarUrl || user.photoURL;
      if (photoUrl) {
        headers['x-user-photo'] = encodeURIComponent(photoUrl);
      }
    }

    return headers;
  }, [user, userProfile]);

  /**
   * 댓글 목록 조회
   */
  const fetchComments = useCallback(async (reset: boolean = true) => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '20' });

      if (!reset && nextCursor) {
        params.set('cursor', nextCursor);
      }

      const response = await fetch(`/api/community/posts/${postId}/comments?${params}`);
      const result: CommunityApiResponse<CommentsListResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '댓글을 불러오는데 실패했습니다.');
      }

      const { comments: newComments, hasMore: more, nextCursor: cursor } = result.data;

      if (reset) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }

      setHasMore(more);
      setNextCursor(cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, nextCursor]);

  /**
   * 더 많은 댓글 로드
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchComments(false);
    }
  }, [isLoading, hasMore, fetchComments]);

  /**
   * 새 댓글 작성
   *
   * 인증 헤더 포함하여 API 호출 (로그인 필요)
   */
  const createComment = useCallback(async (data: CreateCommentRequest): Promise<CommunityComment | null> => {
    if (!postId) return null;

    try {
      // 인증 헤더 포함하여 API 호출
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result: CommunityApiResponse<CommunityComment> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '댓글 작성에 실패했습니다.');
      }

      // 새 댓글을 목록 끝에 추가
      setComments(prev => [...prev, result.data!]);

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다.');
      return null;
    }
  }, [postId, getAuthHeaders]);

  /**
   * postId가 변경되면 댓글 다시 로드
   *
   * fetchComments를 의존성 배열에 포함하지 않는 이유:
   * - fetchComments는 nextCursor에 의존하므로 매 렌더링마다 새로 생성됨
   * - 이 useEffect는 postId 변경 시에만 reset=true로 호출해야 함
   * - reset=true일 때 nextCursor는 사용되지 않으므로 의존성 불필요
   */
  useEffect(() => {
    if (postId) {
      setNextCursor(undefined);
      fetchComments(true);
    }
  // fetchComments는 nextCursor 의존성으로 인해 안정적이지 않음 - 의도적 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return {
    comments,
    isLoading,
    error,
    hasMore,
    fetchComments,
    loadMore,
    createComment,
  };
}

// =====================================================
// 종목별 커뮤니티 훅
// =====================================================

interface UseTickerCommunityOptions {
  /** 조회할 종목 코드 (ticker) */
  ticker: string;
  /** 시장 코드 ('KR' | 'US') */
  market: 'KR' | 'US';
  /** 종목명 (글 작성 시 태그에 사용) */
  stockName: string;
  /** 최대 조회 개수 (기본: 5) */
  limit?: number;
  /** 자동 조회 여부 (기본: true) */
  autoFetch?: boolean;
}

/**
 * 종목별 커뮤니티 게시글 관리 훅
 *
 * 특정 종목이 태그된 게시글만 필터링하여 조회합니다.
 * 글 작성 시 현재 종목을 자동으로 태깅합니다.
 *
 * @param options 옵션
 * @returns 게시글 목록 및 CRUD 함수
 *
 * @example
 * ```tsx
 * const { posts, createPost, isLoading } = useTickerCommunity({
 *   ticker: 'AAPL',
 *   market: 'US',
 *   stockName: 'Apple Inc.',
 *   limit: 5,
 * });
 * ```
 */
export function useTickerCommunity(options: UseTickerCommunityOptions) {
  const { ticker, market, stockName, limit = 5, autoFetch = true } = options;

  // AuthProvider의 useAuth 훅으로 사용자 정보 가져오기
  const { user, userProfile } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  /**
   * API 요청 시 사용할 인증 헤더 생성
   * (useCommunity의 getAuthHeaders와 동일한 로직)
   */
  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (user?.uid) {
      headers['x-user-id'] = user.uid;

      // 사용자 이름(닉네임) 설정
      const userName =
        (userProfile?.nickname && userProfile.nickname.trim()) ||
        (userProfile?.displayName && userProfile.displayName.trim()) ||
        user.displayName ||
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        '사용자';
      headers['x-user-name'] = encodeURIComponent(userName);

      // 사용자 핸들(@아이디) 설정
      const userHandle =
        userProfile?.email?.split('@')[0] ||
        user.email?.split('@')[0] ||
        user.uid.slice(0, 8);
      headers['x-user-handle'] = encodeURIComponent(userHandle);

      // 프로필 이미지 설정
      const photoUrl = userProfile?.avatarUrl || user.photoURL;
      if (photoUrl) {
        headers['x-user-photo'] = encodeURIComponent(photoUrl);
      }
    }

    return headers;
  }, [user, userProfile]);

  /**
   * 종목별 게시글 목록 조회
   *
   * Firestore에서 tickers 배열에 현재 종목이 포함된 글만 조회
   * (array-contains 쿼리 사용)
   */
  const fetchPosts = useCallback(async () => {
    if (!ticker) return;

    setIsLoading(true);
    setError(null);

    try {
      // ticker 파라미터로 종목별 필터링
      const params = new URLSearchParams({
        ticker,
        sort: 'latest',
        limit: String(limit),
      });

      const response = await fetch(`/api/community/posts?${params}`, {
        headers: getAuthHeaders(),
      });
      const result: CommunityApiResponse<PostsListResponse> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '게시글을 불러오는데 실패했습니다.');
      }

      setPosts(result.data.posts);
      setHasMore(result.data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [ticker, limit, getAuthHeaders]);

  /**
   * 게시글 새로고침
   */
  const refetch = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  /**
   * 새 게시글 작성
   *
   * 현재 종목을 자동으로 태깅합니다.
   * - tickers: 종목 코드 배열에 현재 종목 추가
   * - markets: 시장 코드 배열에 현재 시장 추가
   * - tickerNames: 종목명 배열에 현재 종목명 추가
   *
   * @param content 게시글 내용
   * @returns 생성된 게시글
   */
  const createPost = useCallback(async (content: string): Promise<CommunityPost | null> => {
    try {
      // 해시태그 추출
      const hashtagMatches = content.match(/#([^\s#]+)/g);
      const hashtags = hashtagMatches
        ? hashtagMatches.map(tag => tag.slice(1))
        : [];

      // 본문에서 추가 티커 추출
      const tickerMatches = content.match(/\$([A-Za-z0-9]+)/g);
      const contentTickers = tickerMatches
        ? tickerMatches.map(tag => tag.slice(1).toUpperCase())
        : [];

      // 현재 종목을 포함한 티커 배열 생성 (중복 제거)
      const allTickers = [...new Set([ticker, ...contentTickers])];

      // 요청 데이터 생성
      const postData: CreatePostRequest = {
        content,
        category: 'stock',
        tickers: allTickers,
        markets: [market],
        tickerNames: [stockName],
        hashtags,
      };

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      });

      const result: CommunityApiResponse<CommunityPost> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '게시글 작성에 실패했습니다.');
      }

      // 새 게시글을 목록 맨 앞에 추가
      setPosts(prev => [result.data!, ...prev.slice(0, limit - 1)]);

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 작성에 실패했습니다.');
      return null;
    }
  }, [ticker, market, stockName, limit, getAuthHeaders]);

  /**
   * 좋아요 토글
   */
  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result: CommunityApiResponse<{ liked: boolean; likesCount: number }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || '좋아요 처리에 실패했습니다.');
      }

      // 게시글 목록에서 좋아요 상태 업데이트
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: result.data!.liked,
                likesCount: result.data!.likesCount,
              }
            : post
        )
      );

      return result.data.liked;
    } catch {
      return false;
    }
  }, [getAuthHeaders]);

  /**
   * ticker가 변경되면 게시글 다시 로드
   */
  useEffect(() => {
    if (autoFetch && ticker) {
      fetchPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, autoFetch]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    fetchPosts,
    refetch,
    createPost,
    toggleLike,
  };
}
