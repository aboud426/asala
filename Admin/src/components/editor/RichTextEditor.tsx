import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useDirection } from '@/contexts/DirectionContext';
import { MenuBar } from './MenuBar';
import { ResizableImage } from './ResizableImage';
import './editor.css';
import { cn } from '@/lib/utils';
import { useImperativeHandle, forwardRef } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
}

export interface RichTextEditorRef {
  getHTML: () => string;
  getEditor: () => Editor | null;
  clearContent: () => void;
  setContent: (content: string) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  dir = 'auto',
}, ref) => {
  const { direction, isRTL } = useDirection();
  
  // Use provided dir or fall back to context direction
  const editorDirection = dir === 'auto' ? direction : dir;
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      ResizableImage,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
          editorDirection === 'rtl' && 'rtl-editor'
        ),
        dir: editorDirection,
      },
    },
  }, [editorDirection]);

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getEditor: () => editor,
    clearContent: () => editor?.commands.clearContent(),
    setContent: (newContent: string) => editor?.commands.setContent(newContent),
  }));

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg bg-background", editorDirection === 'rtl' && 'rtl')}>
      {editable && <MenuBar editor={editor} direction={editorDirection} />}
      <EditorContent editor={editor} />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

