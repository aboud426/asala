# Rich Text Editor

A powerful Notion-like rich text editor built with Tiptap for React with full bilingual support (English & Arabic).

## Features

- **🌐 Bilingual Support**: Full RTL/LTR support for Arabic and English
- **Text Formatting**: Bold, italic, underline, strikethrough, code, and highlight
- **Headings**: Three levels of headings (H1, H2, H3)
- **Lists**: Bullet lists, ordered lists, and task lists with checkboxes
- **Tables**: Resizable tables with headers
- **Alignment**: Left, center, right, and justify text alignment
- **Media**: Insert images (with drag-to-resize and alignment) and links
- **Resizable Images**: Click and drag images to resize them while maintaining aspect ratio
- **Image Alignment**: Align images left, center, or right when selected
- **Code Blocks**: Syntax-highlighted code blocks
- **Blockquotes**: Beautiful blockquote styling
- **Typography**: Smart quotes, ellipsis, and other typographic enhancements
- **Undo/Redo**: Full history support
- **Arabic Fonts**: Automatic Arabic font support in RTL mode

## Usage

### Basic Usage

```tsx
import { RichTextEditor } from '@/components/editor';
import { useState } from 'react';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
      editable={true}
      dir="auto" // 'auto' uses context direction, or specify 'ltr' or 'rtl'
    />
  );
}
```

### Using Editor Ref for Export

To access the editor instance directly and use `editor.getHTML()` for exports:

```tsx
import { RichTextEditor, RichTextEditorRef, exportContent } from '@/components/editor';
import { useRef } from 'react';

function MyComponent() {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [content, setContent] = useState('');

  const handleExport = () => {
    // Get HTML directly from editor instance
    const html = editorRef.current?.getHTML() || '';
    exportContent.asFullHTML(html);
  };

  const handleClear = () => {
    editorRef.current?.clearContent();
  };

  const handleSetContent = (newContent: string) => {
    editorRef.current?.setContent(newContent);
  };

  return (
    <>
      <RichTextEditor
        ref={editorRef}
        content={content}
        onChange={setContent}
        placeholder="Start writing..."
      />
      <button onClick={handleExport}>Export HTML</button>
      <button onClick={handleClear}>Clear</button>
    </>
  );
}
```

### Editor Ref API

The `RichTextEditorRef` exposes these methods:

- `getHTML()` - Get current HTML content from editor (most up-to-date)
- `getEditor()` - Get the Tiptap editor instance
- `clearContent()` - Clear all editor content
- `setContent(html: string)` - Set new content programmatically

### Bilingual Usage

The editor automatically integrates with your app's `DirectionContext` to support both LTR and RTL text:

```tsx
// The editor respects the global direction context
// Users can toggle between LTR/RTL using the Languages button in the toolbar

// Or you can force a specific direction
<RichTextEditor dir="rtl" /> // Force RTL for Arabic
<RichTextEditor dir="ltr" /> // Force LTR for English
<RichTextEditor dir="auto" /> // Use context direction (default)
```

## Props

- `content` (string, optional): Initial HTML content
- `onChange` (function, optional): Callback when content changes, receives HTML string
- `placeholder` (string, optional): Placeholder text when editor is empty
- `editable` (boolean, optional): Whether the editor is editable (default: true)
- `dir` ('ltr' | 'rtl' | 'auto', optional): Text direction - 'auto' uses context (default: 'auto')

## Extensions Used

- StarterKit: Basic text editing functionality
- Placeholder: Show placeholder text
- Table: Table support with resizing
- TaskList & TaskItem: Checkbox todo lists
- Typography: Smart typography enhancements
- Underline: Underline text
- TextAlign: Text alignment options
- Highlight: Highlight text
- Image: Embed images
- Link: Add hyperlinks
- TextStyle & Color: Text styling and colors

## Image Management

The editor includes a custom resizable image extension with alignment options:

### How to Use Images

1. **Insert an image** using the image button in the toolbar (enter URL)
2. **Click on the image** to select it
3. **Alignment buttons appear** in the toolbar:
   - **Align Left** (📐) - Image aligns to the left (default)
   - **Align Center** (📐) - Image centers in the editor
   - **Align Right** (📐) - Image aligns to the right
4. **Move**: Click and drag the image to reposition it in your document
5. **Resize**: A blue resize handle appears in the bottom-right corner - drag to resize
6. **Aspect ratio is maintained** automatically during resize

### Image Features

- **Visual Feedback**: Selected images have a blue outline
- **Drag to Move**: Click and drag images to reposition them in your document
- **Grab Cursor**: Hover shows a grab cursor indicating the image can be moved
- **Alignment Options**: Left, center, or right alignment with toolbar buttons
- **Smooth Resizing**: Real-time visual feedback while dragging the resize handle
- **Aspect Ratio Lock**: Images maintain their proportions automatically
- **Minimum Size**: Images cannot be resized below 100px width
- **RTL Support**: Resize handle appears in bottom-left corner for RTL languages
- **Export Support**: Resized dimensions and alignment are preserved in HTML exports
- **Contextual Toolbar**: Alignment buttons only appear when an image is selected
- **No Duplication**: Dragging moves the image without creating copies

## Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + Shift + X` - Strikethrough

## Bilingual Features

### RTL/LTR Support

- **Automatic Direction**: The editor automatically adjusts layout for RTL (Arabic) and LTR (English) text
- **Direction Toggle**: Built-in toolbar button (🌐) to switch between LTR and RTL
- **Smart Alignment**: Text alignment, lists, and blockquotes adapt to the current direction
- **Arabic Fonts**: Custom Arabic font stack (Tajawal, Cairo, Amiri, Scheherazade) in RTL mode
- **Mixed Content**: Supports documents with both Arabic and English content

### Styling

The editor uses Tailwind's typography plugin for prose styling. Make sure you have `@tailwindcss/typography` installed and configured in your Tailwind config.

Custom styles are defined in `editor.css` with full RTL/LTR support and can be customized to match your theme.

## Export Functionality

The editor includes powerful export utilities that can be used throughout your application.

### Using Export Utilities

Import the export utilities and use with `editor.getHTML()`:

```tsx
import { RichTextEditor, RichTextEditorRef, exportContent } from '@/components/editor';
import { useRef } from 'react';

function MyComponent() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleExport = () => {
    // Always use editor.getHTML() for most up-to-date content
    const html = editorRef.current?.getHTML() || '';
    exportContent.asFullHTML(html);
  };

  return (
    <>
      <RichTextEditor ref={editorRef} />
      <button onClick={handleExport}>Export</button>
    </>
  );
}
```

### Export Methods

#### 1. Export Full HTML Document

Downloads a complete, standalone HTML file with embedded styles:

```tsx
// Get HTML from editor
const html = editorRef.current?.getHTML() || '';

// Export with default filename and title
exportContent.asFullHTML(html);

// Export with custom filename
exportContent.asFullHTML(html, 'my-document.html');

// Export with custom title
exportContent.asFullHTML(html, 'my-document.html', 'My Document Title');
```

Features:

- Embedded CSS styles
- RTL/LTR support
- Arabic font support
- All formatting preserved
- Ready to open in any browser
- Timestamped default filename

#### 2. Export Content Only

Downloads just the HTML content without styles:

```tsx
// Get HTML from editor
const html = editorRef.current?.getHTML() || '';

// Export with default filename
exportContent.asContentOnly(html);

// Export with custom filename
exportContent.asContentOnly(html, 'content-only.html');
```

Perfect for:

- Embedding in existing pages
- Smaller file size
- Integration with other systems

#### 3. Copy Full HTML to Clipboard

Copies complete HTML with styles to clipboard:

```tsx
// Get HTML from editor
const html = editorRef.current?.getHTML() || '';

const success = await exportContent.copyFull(html);
if (success) {
  console.log('Copied successfully!');
}

// With custom title
const success = await exportContent.copyFull(html, 'My Document');
```

#### 4. Copy Content Only to Clipboard

Copies just the HTML content:

```tsx
// Get HTML from editor
const html = editorRef.current?.getHTML() || '';

const success = await exportContent.copyContent(html);
if (success) {
  console.log('Copied successfully!');
}
```

### Advanced Usage

For more control, use the individual utility functions:

```tsx
import { 
  generateFullHTML, 
  downloadHTML, 
  copyHTMLToClipboard 
} from '@/components/editor';

// Generate HTML string
const html = generateFullHTML(content, 'Custom Title');

// Download with options
downloadHTML({
  content,
  filename: 'custom-name.html',
  includeStyles: true,
  title: 'Custom Document Title'
});

// Copy to clipboard with options
const success = await copyHTMLToClipboard({
  content,
  includeStyles: true,
  title: 'Custom Title'
});
```

### Export Features

- **Bilingual Support**: Exported HTML includes full RTL/LTR styles
- **Standalone Files**: Full HTML exports work without external dependencies
- **Timestamped**: Default filenames include current date (e.g., `document-2025-10-03.html`)
- **Type-Safe**: Full TypeScript support with proper types
- **Error Handling**: Returns boolean success status for clipboard operations

## Demo

Visit `/rich-text-editor` to see a live demo with examples, usage instructions, and export functionality.
