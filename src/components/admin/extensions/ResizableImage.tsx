'use client';

/**
 * ResizableImage - Tiptap 이미지 리사이즈 확장
 *
 * 이미지 선택 시 크기 조절 UI를 표시합니다.
 * - 프리셋 버튼: 25%, 50%, 75%, 100%
 * - 드래그로 자유롭게 크기 조절
 *
 * @see https://tiptap.dev/docs/editor/extensions/nodes/image
 */

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================
// TypeScript 타입 확장
// ============================================

/**
 * setImage 커맨드의 옵션 타입
 */
interface SetImageOptions {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
}

/**
 * Tiptap Commands 인터페이스 확장
 * setImage 커맨드를 전역으로 사용할 수 있도록 선언
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * 이미지를 삽입합니다.
       */
      setImage: (options: SetImageOptions) => ReturnType;
    };
  }
}

// ============================================
// 이미지 노드뷰 컴포넌트 (리사이즈 UI 포함)
// ============================================

/**
 * 이미지 리사이즈 컴포넌트
 *
 * 이미지 클릭 시 리사이즈 UI를 표시하고,
 * 프리셋 버튼 또는 드래그로 크기를 조절할 수 있습니다.
 */
function ResizableImageComponent({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  // 드래그 상태
  const [isResizing, setIsResizing] = useState(false);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialX, setInitialX] = useState(0);

  // 현재 너비 상태 (실시간 표시용)
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);

  // 이미지 참조
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 속성에서 값 추출
  const { src, alt, width } = node.attrs;

  // 이미지 로드 후 너비 업데이트
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setDisplayWidth(imageRef.current.offsetWidth);
    }
  }, [width]);

  /**
   * 프리셋 크기로 변경
   * @param percentage - 원본 대비 비율 (예: 50 = 50%)
   */
  const setPresetSize = useCallback(
    (percentage: number) => {
      if (!imageRef.current) return;

      // 원본 이미지 크기 가져오기 (naturalWidth)
      const naturalWidth = imageRef.current.naturalWidth;

      if (percentage === 100) {
        // 100%는 auto로 설정 (최대 너비는 CSS로 제한)
        updateAttributes({ width: 'auto' });
        setDisplayWidth(null);
      } else {
        // 퍼센트에 맞는 픽셀 값 계산
        const newWidth = Math.round(naturalWidth * (percentage / 100));
        updateAttributes({ width: `${newWidth}px` });
        setDisplayWidth(newWidth);
      }
    },
    [updateAttributes]
  );

  /**
   * 드래그 시작 핸들러
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentWidth = imageRef.current?.offsetWidth || 0;
      setIsResizing(true);
      setInitialWidth(currentWidth);
      setInitialX(e.clientX);
    },
    []
  );

  /**
   * 드래그 중 핸들러
   */
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - initialX;
      const newWidth = Math.max(50, initialWidth + deltaX); // 최소 50px
      updateAttributes({ width: `${newWidth}px` });
      setDisplayWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, initialX, initialWidth, updateAttributes]);

  /**
   * 이미지 로드 완료 핸들러
   */
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setDisplayWidth(imageRef.current.offsetWidth);
    }
  }, []);

  return (
    <NodeViewWrapper className="relative inline-block my-4">
      <div
        ref={containerRef}
        className={`
          relative inline-block
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${isResizing ? 'select-none' : ''}
        `}
      >
        {/* 이미지 */}
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          onLoad={handleImageLoad}
          style={{
            width: width === 'auto' ? 'auto' : width,
            maxWidth: '100%',
            height: 'auto',
          }}
          className="rounded-lg block"
          draggable={false}
        />

        {/* 선택 시 리사이즈 UI 표시 */}
        {selected && (
          <>
            {/* 크기 조절 프리셋 버튼 */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gray-900/90 rounded-lg px-2 py-1 shadow-lg">
              <button
                type="button"
                onClick={() => setPresetSize(25)}
                className="px-2 py-0.5 text-xs text-white hover:bg-white/20 rounded transition-colors"
                title="25% 크기"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => setPresetSize(50)}
                className="px-2 py-0.5 text-xs text-white hover:bg-white/20 rounded transition-colors"
                title="50% 크기"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setPresetSize(75)}
                className="px-2 py-0.5 text-xs text-white hover:bg-white/20 rounded transition-colors"
                title="75% 크기"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setPresetSize(100)}
                className="px-2 py-0.5 text-xs text-white hover:bg-white/20 rounded transition-colors"
                title="원본 크기"
              >
                100%
              </button>

              {/* 현재 크기 표시 */}
              <span className="px-2 text-xs text-gray-400 border-l border-gray-600 ml-1">
                {displayWidth ? `${displayWidth}px` : width === 'auto' ? '자동' : width}
              </span>
            </div>

            {/* 우측 하단 리사이즈 핸들 */}
            <div
              onMouseDown={handleMouseDown}
              className={`
                absolute bottom-0 right-0 w-4 h-4
                bg-blue-500 rounded-tl-md cursor-se-resize
                flex items-center justify-center
                hover:bg-blue-600 transition-colors
                ${isResizing ? 'bg-blue-600' : ''}
              `}
              title="드래그하여 크기 조절"
            >
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                />
              </svg>
            </div>

            {/* 좌측 상단 삭제 버튼 */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // deleteNode 함수로 이미지 노드 삭제
                deleteNode();
              }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
              title="이미지 삭제"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ============================================
// Tiptap 확장 정의
// ============================================

/**
 * ResizableImage 확장
 *
 * 기본 Image 확장을 대체하여 리사이즈 기능을 추가합니다.
 */
export const ResizableImage = Node.create({
  name: 'image',

  // 블록 요소로 설정
  group: 'block',

  // 이미지 노드는 자식을 가지지 않음 (atom)
  atom: true,

  // 드래그 가능
  draggable: true,

  /**
   * 속성 정의
   */
  addAttributes() {
    return {
      // 이미지 URL
      src: {
        default: null,
      },
      // 대체 텍스트
      alt: {
        default: null,
      },
      // 제목
      title: {
        default: null,
      },
      // 너비 (리사이즈용)
      width: {
        default: 'auto',
        // HTML에서 렌더링할 때 style 속성으로 변환
        renderHTML: (attributes) => {
          if (!attributes.width || attributes.width === 'auto') {
            return {};
          }
          return {
            style: `width: ${attributes.width}`,
          };
        },
        // HTML 파싱 시 style에서 width 추출
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width');
          return width || 'auto';
        },
      },
    };
  },

  /**
   * HTML 파싱 규칙
   */
  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  /**
   * HTML 렌더링 규칙
   */
  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(
        {
          class: 'max-w-full h-auto rounded-lg',
        },
        HTMLAttributes
      ),
    ];
  },

  /**
   * React 노드뷰 사용
   */
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  /**
   * 명령어 추가
   */
  addCommands() {
    return {
      setImage:
        (options: SetImageOptions) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default ResizableImage;
