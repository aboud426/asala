# Rich Text Editor

A powerful Notion-like rich text editor built with Tiptap for React.

## Features

- **Text Formatting**: Bold, italic, underline, strikethrough, code, and highlight
- **Headings**: Three levels of headings (H1, H2, H3)
- **Lists**: Bullet lists, ordered lists, and task lists with checkboxes
- **Tables**: Resizable tables with headers
- **Alignment**: Left, center, right, and justify text alignment
- **Media**: Insert images and links
- **Code Blocks**: Syntax-highlighted code blocks
- **Blockquotes**: Beautiful blockquote styling
- **Typography**: Smart quotes, ellipsis, and other typographic enhancements
- **Undo/Redo**: Full history support

## Usage

```tsx
import { RichTextEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
      editable={true}
    />
  );
}
```

## Props

- `content` (string, optional): Initial HTML content
- `onChange` (function, optional): Callback when content changes, receives HTML string
- `placeholder` (string, optional): Placeholder text when editor is empty
- `editable` (boolean, optional): Whether the editor is editable (default: true)

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

## Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + Shift + X` - Strikethrough

## Styling

The editor uses Tailwind's typography plugin for prose styling. Make sure you have `@tailwindcss/typography` installed and configured in your Tailwind config.

Custom styles are defined in `editor.css` and can be customized to match your theme.

## Demo

Visit `/rich-text-editor` to see a live demo with examples and usage instructions.
