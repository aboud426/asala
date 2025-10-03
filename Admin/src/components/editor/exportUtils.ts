/**
 * Utility functions for exporting rich text editor content
 */

interface ExportOptions {
  content: string;
  filename?: string;
  includeStyles?: boolean;
  title?: string;
}

/**
 * Generate a complete HTML document with styles
 */
export const generateFullHTML = (content: string, title: string = 'Exported Document'): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        color: #333;
      }
      
      [dir="rtl"] {
        direction: rtl;
        text-align: right;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          'Tajawal', 'Cairo', 'Amiri', 'Scheherazade', sans-serif;
        line-height: 1.8;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      
      p { margin-bottom: 16px; }
      
      ul, ol {
        padding-left: 2em;
        margin-bottom: 16px;

      }
      
      [dir="rtl"] ul,
      [dir="rtl"] ol {
        padding-left: 0;
        padding-right: 2em;
      }
      
      li { margin-bottom: 8px; }
      
      blockquote {
        border-left: 3px solid #e2e8f0;
        padding-left: 16px;
        margin: 16px 0;
        font-style: italic;
        color: #64748b;
      }
      
      [dir="rtl"] blockquote {
        border-left: none;
        border-right: 3px solid #e2e8f0;
        padding-left: 0;
        padding-right: 16px;
      }
      
      code {
        background-color: #f1f5f9;
        border-radius: 4px;
        color: #e11d48;
        font-size: 0.9em;
        padding: 2px 6px;
      }
      
      pre {
        background: #1e293b;
        border-radius: 8px;
        color: #f8fafc;
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;
      }
      
      pre code {
        background: none;
        color: inherit;
        padding: 0;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }
      
      table td, table th {
        border: 2px solid #e2e8f0;
        padding: 8px;
      }
      
      table th {
        background-color: #f8fafc;
        font-weight: 600;
        text-align: left;
      }
      
      [dir="rtl"] table th {
        text-align: right;
      }
      
      a {
        color: #3b82f6;
        text-decoration: underline;
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 16px 0;
        display: block;
      }
      
      /* Image wrapper alignment */
      .image-wrapper {
        display: block;
        margin: 16px 0;
      }
      
      .image-wrapper[data-align="left"] {
        margin-left: 0;
        margin-right: auto;
      }
      
      .image-wrapper[data-align="center"] {
        margin-left: auto;
        margin-right: auto;
      }
      
      .image-wrapper[data-align="right"] {
        margin-left: auto;
        margin-right: 0;
      }
      
      .image-wrapper img {
        width: 100%;
        height: auto;
      }
      
      mark {
        background-color: #fef08a;
        border-radius: 2px;
        padding: 2px 4px;
      }
      
      ul[data-type="taskList"] {
        list-style: none;
        padding-left: 0;
      }
      
      ul[data-type="taskList"] li {
        display: flex;
        align-items: flex-start;
      }
      
      ul[data-type="taskList"] input[type="checkbox"] {
        margin-right: 8px;
        margin-top: 4px;
      }
      
      [dir="rtl"] ul[data-type="taskList"] input[type="checkbox"] {
        margin-right: 0;
        margin-left: 8px;
      }
    </style>
</head>
<body>
${content}
</body>
</html>`;
};

/**
 * Download HTML content as a file
 */
export const downloadHTML = ({
  content,
  filename,
  includeStyles = true,
  title = 'Exported Document',
}: ExportOptions): void => {
  const html = includeStyles ? generateFullHTML(content, title) : content;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `document-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy HTML content to clipboard
 */
export const copyHTMLToClipboard = async ({
  content,
  includeStyles = false,
  title = 'Exported Document',
}: Omit<ExportOptions, 'filename'>): Promise<boolean> => {
  try {
    const html = includeStyles ? generateFullHTML(content, title) : content;
    await navigator.clipboard.writeText(html);
    return true;
  } catch (error) {
    console.error('Failed to copy HTML to clipboard:', error);
    return false;
  }
};

/**
 * Export content to various formats
 */
export const exportContent = {
  /**
   * Export as full HTML document with styles
   */
  asFullHTML: (content: string, filename?: string, title?: string) => {
    downloadHTML({ content, filename, includeStyles: true, title });
  },

  /**
   * Export as content-only HTML (no styles)
   */
  asContentOnly: (content: string, filename?: string) => {
    downloadHTML({ content, filename, includeStyles: false });
  },

  /**
   * Copy full HTML with styles to clipboard
   */
  copyFull: async (content: string, title?: string): Promise<boolean> => {
    return copyHTMLToClipboard({ content, includeStyles: true, title });
  },

  /**
   * Copy content-only HTML to clipboard
   */
  copyContent: async (content: string): Promise<boolean> => {
    return copyHTMLToClipboard({ content, includeStyles: false });
  },
};


