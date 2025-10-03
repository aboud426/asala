import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RichTextEditor, RichTextEditorRef, exportContent } from '@/components/editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Eye, Languages, Download, Copy, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const RichTextEditorPage = () => {
  const { toast } = useToast();
  const editorRef = useRef<RichTextEditorRef>(null);
  const [content, setContent] = useState<string>(`
    <h1>Welcome to the Rich Text Editor - مرحباً بك في محرر النصوص</h1>
    <p>This is a powerful <strong>Notion-like editor</strong> built with <em>Tiptap</em>.</p>
    <p>هذا محرر نصوص <strong>قوي يشبه Notion</strong> مبني باستخدام <em>Tiptap</em>.</p>
    
    <h2>Features - المميزات</h2>
    <ul>
      <li>Rich text formatting - تنسيق نص متقدم</li>
      <li>Multiple heading levels - مستويات عناوين متعددة</li>
      <li>Lists (bullet, ordered, and task lists) - قوائم (نقطية، مرقمة، ومهام)</li>
      <li>Tables with resizable columns - جداول بأعمدة قابلة لتغيير الحجم</li>
      <li>Bilingual support (English & Arabic) - دعم ثنائي اللغة (عربي وإنجليزي)</li>
      <li>RTL/LTR automatic switching - تبديل تلقائي بين اليمين واليسار</li>
    </ul>

    <h3>Try the Task List - جرب قائمة المهام</h3>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="true">Create the editor - إنشاء المحرر</li>
      <li data-type="taskItem" data-checked="true">Add bilingual support - إضافة الدعم ثنائي اللغة</li>
      <li data-type="taskItem" data-checked="false">Use it in your project - استخدامه في مشروعك</li>
    </ul>

    <blockquote>
      <p>Click the 🌐 button in the toolbar to switch between English (LTR) and Arabic (RTL)!</p>
      <p>انقر على زر 🌐 في شريط الأدوات للتبديل بين الإنجليزية والعربية!</p>
    </blockquote>
  `);

  const [showPreview, setShowPreview] = useState(false);

  const handleClear = () => {
    editorRef.current?.clearContent();
  };

  const handleLoadSample = () => {
    const sampleContent = `
      <h1>Sample Document - مستند نموذجي</h1>
      <p>This is a sample document with various formatting options.</p>
      <p>هذا مستند نموذجي يحتوي على خيارات تنسيق متنوعة.</p>
      
      <h2>Table Example - مثال على جدول</h2>
      <table>
        <tr>
          <th>Feature - الميزة</th>
          <th>Status - الحالة</th>
          <th>Priority - الأولوية</th>
        </tr>
        <tr>
          <td>Rich Text - نص منسق</td>
          <td>Complete - مكتمل</td>
          <td>High - عالية</td>
        </tr>
        <tr>
          <td>Tables - جداول</td>
          <td>Complete - مكتمل</td>
          <td>Medium - متوسطة</td>
        </tr>
        <tr>
          <td>Images - صور</td>
          <td>Complete - مكتمل</td>
          <td>Low - منخفضة</td>
        </tr>
      </table>

      <h3>Task List - قائمة المهام</h3>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">Create bilingual editor - إنشاء محرر ثنائي اللغة</li>
        <li data-type="taskItem" data-checked="true">Add RTL support - إضافة دعم اليمين إلى اليسار</li>
        <li data-type="taskItem" data-checked="false">Test with Arabic content - اختبار مع المحتوى العربي</li>
      </ul>
    `;
    editorRef.current?.setContent(sampleContent);
  };

  const handleExportHTML = () => {
    const html = editorRef.current?.getHTML() || '';
    exportContent.asFullHTML(html, undefined, 'Exported Document');
    toast({
      title: 'HTML Exported',
      description: 'Your document has been exported as HTML file.',
    });
  };

  const handleExportHTMLOnly = () => {
    const html = editorRef.current?.getHTML() || '';
    exportContent.asContentOnly(html);
    toast({
      title: 'HTML Content Exported',
      description: 'Your content has been exported (HTML only).',
    });
  };

  const handleCopyHTML = async () => {
    const html = editorRef.current?.getHTML() || '';
    const success = await exportContent.copyContent(html);
    if (success) {
      toast({
        title: 'Copied to Clipboard',
        description: 'HTML content has been copied to your clipboard.',
      });
    } else {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy HTML to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyFullHTML = async () => {
    const html = editorRef.current?.getHTML() || '';
    const success = await exportContent.copyFull(html, 'Exported Document');
    if (success) {
      toast({
        title: 'Copied to Clipboard',
        description: 'Full HTML document has been copied to your clipboard.',
      });
    } else {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy HTML to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rich Text Editor</h1>
            <p className="text-muted-foreground mt-2">
              A powerful Notion-like editor built with Tiptap
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleExportHTML}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Export Full HTML (with styles)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTMLOnly}>
                  <Code className="h-4 w-4 mr-2" />
                  Export Content Only
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyFullHTML}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyHTML}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={handleClear} size="sm">
              Clear
            </Button>
            <Button variant="outline" onClick={handleLoadSample} size="sm">
              Load Sample (AR/EN)
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              size="sm"
            >
              {showPreview ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="html">HTML Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Editor</CardTitle>
                <CardDescription>
                  Use the toolbar to format your text with powerful editing features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <div 
                      className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: editorRef.current?.getHTML() || content }}
                    />
                  </ScrollArea>
                ) : (
                  <RichTextEditor
                    ref={editorRef}
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your document..."
                    editable={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="html" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>HTML Output</CardTitle>
                <CardDescription>
                  The generated HTML from your document (live from editor.getHTML())
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{editorRef.current?.getHTML() || content}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📥 Export Options</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Export Full HTML</strong> - Complete HTML document with embedded styles, ready to use standalone</li>
                <li><strong>Export Content Only</strong> - Just the HTML content without styles, for embedding in other pages</li>
                <li><strong>Copy Full HTML</strong> - Copy complete HTML with styles to clipboard</li>
                <li><strong>Copy Content HTML</strong> - Copy just the content HTML to clipboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🌐 Language & Direction Support</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click the <Languages className="inline h-3 w-3" /> button in the toolbar to toggle between LTR (English) and RTL (Arabic)</li>
                <li>The editor automatically adapts layout, alignment, and styling for Arabic text</li>
                <li>Supports mixed content with both English and Arabic</li>
                <li>Arabic fonts are automatically applied when in RTL mode</li>
                <li>Exported HTML includes RTL/LTR styles automatically</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Toolbar Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use the toolbar buttons to format text, add headings, lists, and more</li>
                <li>Click the table icon to insert a 3x3 table</li>
                <li>Click the image icon to add an image by URL</li>
                <li><strong>Move images:</strong> Click and drag any image to reposition it in your document</li>
                <li><strong>Image alignment:</strong> When you click an image, alignment buttons appear (left, center, right)</li>
                <li>Click the link icon to add hyperlinks to selected text</li>
                <li><strong>Resize images:</strong> Click an image to select it, then drag the blue handle to resize</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Text Selection</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Select text and use toolbar buttons for formatting</li>
                <li>Drag and drop to rearrange content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><code>Ctrl/Cmd + B</code> - Bold</li>
                <li><code>Ctrl/Cmd + I</code> - Italic</li>
                <li><code>Ctrl/Cmd + U</code> - Underline</li>
                <li><code>Ctrl/Cmd + Z</code> - Undo</li>
                <li><code>Ctrl/Cmd + Shift + Z</code> - Redo</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RichTextEditorPage;

