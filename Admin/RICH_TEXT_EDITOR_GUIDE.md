# Rich Text Editor Guide

## Overview
A fully-featured rich text editor integrated with the Asala Admin Dashboard, supporting RTL/LTR layouts and light/dark themes.

## Access the Editor
Navigate to `/rich-text-editor` in your admin dashboard, or use the hash route:
```
http://localhost:5173/#/rich-text-editor
```

## Features

### Text Formatting
- **Bold** - Make text bold
- **Italic** - Make text italic  
- **Underline** - Underline text
- **Code** - Format text as inline code

### Headings
- **H1** - Large heading
- **H2** - Medium heading
- **H3** - Small heading

### Lists
- **Bullet List** - Unordered list items
- **Numbered List** - Ordered list items

### Font Sizes
Available sizes: 12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px

### Images
- Click the "Image" button to upload images
- Supports all common image formats
- Images are embedded as base64 in the exported HTML

### Actions
- **Clear** - Clear all content from the editor
- **Export HTML** - Convert editor content to HTML format

## Theme Support

### Dark/Light Mode
The editor automatically adapts to your dashboard's theme settings:
- Light mode: Clean, bright interface
- Dark mode: Easy on the eyes with proper contrast

### RTL/LTR Support
The editor respects the dashboard's direction setting:
- LTR (Left-to-Right): For English and similar languages
- RTL (Right-to-Left): For Arabic and similar languages

## Exporting Content

1. Create your content in the editor
2. Click the "Export HTML" button
3. View the generated HTML code
4. Preview how it will look rendered
5. Click "Copy HTML to Clipboard" to copy the HTML

The exported HTML includes:
- All formatting (bold, italic, underline, etc.)
- Custom font sizes
- Images with proper styling
- Semantic HTML structure

## Keyboard Shortcuts

While editing:
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline

## Technical Details

### Built With
- **Draft.js** - Rich text editor framework
- **draft-js-export-html** - HTML export functionality
- **React** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Integration
The editor is fully integrated with:
- `ThemeContext` - For light/dark mode
- `DirectionContext` - For RTL/LTR support
- `DashboardLayout` - Consistent layout with other pages
- Authentication system - Protected route

## Tips

1. **Images**: Keep images reasonably sized as they're embedded in the HTML
2. **Font Sizes**: Apply font size after selecting text
3. **Lists**: Press Enter to create new list items
4. **Headings**: Each heading starts a new block
5. **Clear Before New**: Use the Clear button to start fresh content

## Future Enhancements

Potential additions:
- Text color picker
- Background color
- Text alignment controls
- Link insertion
- Table support
- Import HTML functionality
- Save/Load drafts
- Export to other formats (Markdown, PDF)

