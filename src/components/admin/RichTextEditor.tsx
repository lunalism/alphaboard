'use client';

/**
 * RichTextEditor - Tiptap 기반 리치 텍스트 에디터
 *
 * 개인정보처리방침, 이용약관 등의 콘텐츠를 WYSIWYG 방식으로 편집합니다.
 *
 * 기능:
 * - 실행취소/다시실행: Undo, Redo
 * - 텍스트 서식: 굵게, 기울임, 밑줄, 취소선
 * - 제목: H1, H2, H3
 * - 목록: 순서 없는 목록, 순서 있는 목록
 * - 인용: Blockquote
 * - 구분선: Horizontal Rule
 * - 링크: URL 링크 추가/제거
 * - 정렬: 좌/중앙/우 정렬
 * - 높이 고정 + 스크롤
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';

// ============================================
// 타입 정의
// ============================================

interface RichTextEditorProps {
  /** 에디터 내용 (HTML 형식) */
  content: string;
  /** 내용 변경 시 콜백 */
  onChange: (html: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

// ============================================
// 툴바 버튼 컴포넌트
// ============================================

interface ToolbarButtonProps {
  /** 버튼 활성화 상태 */
  isActive?: boolean;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 버튼 내용 */
  children: React.ReactNode;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  /** 툴팁 텍스트 */
  title?: string;
}

/**
 * 툴바 버튼 컴포넌트
 * 활성화 상태에 따라 스타일이 변경됩니다.
 */
function ToolbarButton({
  isActive = false,
  onClick,
  children,
  disabled = false,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded-md text-sm font-medium transition-colors
        ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );
}

/**
 * 툴바 구분선 컴포넌트
 */
function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;
}

// ============================================
// 아이콘 컴포넌트들
// ============================================

/** 실행취소 아이콘 */
const UndoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

/** 다시실행 아이콘 */
const RedoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
  </svg>
);

/** 취소선 아이콘 */
const StrikeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 00-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 01-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z" />
  </svg>
);

/** 순서 없는 목록 아이콘 */
const BulletListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="1" cy="6" r="1" fill="currentColor" />
    <circle cx="1" cy="12" r="1" fill="currentColor" />
    <circle cx="1" cy="18" r="1" fill="currentColor" />
  </svg>
);

/** 순서 있는 목록 아이콘 */
const OrderedListIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
  </svg>
);

/** 인용 아이콘 */
const BlockquoteIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
);

/** 구분선 아이콘 */
const HorizontalRuleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
  </svg>
);

/** 링크 아이콘 */
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

/** 좌측 정렬 아이콘 */
const AlignLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
  </svg>
);

/** 중앙 정렬 아이콘 */
const AlignCenterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
  </svg>
);

/** 우측 정렬 아이콘 */
const AlignRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
  </svg>
);

// ============================================
// 메인 에디터 컴포넌트
// ============================================

export function RichTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
}: RichTextEditorProps) {
  // Tiptap 에디터 인스턴스 생성
  const editor = useEditor({
    extensions: [
      // 기본 확장팩 (제목, 목록, 굵게, 기울임, 취소선, 인용, 구분선 등)
      StarterKit.configure({
        // 제목 레벨 제한 (H1, H2, H3만 사용)
        heading: {
          levels: [1, 2, 3],
        },
        // 인용 활성화
        blockquote: {},
        // 구분선 활성화
        horizontalRule: {},
        // 코드블록 비활성화 (별도 확장 사용 가능)
        codeBlock: false,
      }),
      // 밑줄 확장
      Underline,
      // 링크 확장
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300',
        },
      }),
      // 텍스트 정렬 확장
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // 플레이스홀더 확장
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    // 내용 변경 시 콜백 호출
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // 에디터 스타일 설정
    editorProps: {
      attributes: {
        class: 'prose prose-gray dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // 외부에서 content가 변경되면 에디터 내용 업데이트
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  /**
   * 링크 추가/수정 핸들러
   * 프롬프트로 URL을 입력받아 선택된 텍스트에 링크를 적용합니다.
   */
  const setLink = useCallback(() => {
    if (!editor) return;

    // 현재 선택된 텍스트의 링크 URL 가져오기
    const previousUrl = editor.getAttributes('link').href;

    // URL 입력 프롬프트
    const url = window.prompt('링크 URL을 입력하세요:', previousUrl || 'https://');

    // 취소 버튼 클릭 시
    if (url === null) return;

    // 빈 URL 입력 시 링크 제거
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // 링크 적용
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // 에디터가 아직 초기화되지 않은 경우
  if (!editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
        <div className="h-[500px] bg-white dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* ========================================
          툴바 영역 (상단 고정)
          그룹: 실행취소 | 텍스트서식 | 제목 | 목록/인용 | 구분선/링크 | 정렬
          ======================================== */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* 실행취소/다시실행 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행취소 (Ctrl+Z)"
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시실행 (Ctrl+Y)"
        >
          <RedoIcon />
        </ToolbarButton>

        <ToolbarDivider />

        {/* 텍스트 서식 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게 (Ctrl+B)"
        >
          <span className="font-bold text-sm">B</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임 (Ctrl+I)"
        >
          <span className="italic text-sm">I</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="밑줄 (Ctrl+U)"
        >
          <span className="underline text-sm">U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <StrikeIcon />
        </ToolbarButton>

        <ToolbarDivider />

        {/* 제목 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* 목록/인용 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="순서 없는 목록"
        >
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="순서 있는 목록"
        >
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="인용"
        >
          <BlockquoteIcon />
        </ToolbarButton>

        <ToolbarDivider />

        {/* 구분선/링크 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선 삽입"
        >
          <HorizontalRuleIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="링크 추가"
        >
          <LinkIcon />
        </ToolbarButton>

        {/* 링크 제거 버튼 (링크가 선택된 경우에만 표시) */}
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="링크 제거"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* 정렬 그룹 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="좌측 정렬"
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="중앙 정렬"
        >
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="우측 정렬"
        >
          <AlignRightIcon />
        </ToolbarButton>
      </div>

      {/* ========================================
          에디터 영역
          - 고정 높이 (max-height) + 스크롤
          - Tiptap EditorContent 컴포넌트
          ======================================== */}
      <div className="bg-white dark:bg-gray-800 max-h-[500px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
