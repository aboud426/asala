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
            {/* <Button variant="outline" onClick={handleLoadSample} size="sm">
              Load Sample (AR/EN)
            </Button> */}
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
      </div>
    </DashboardLayout>
  );
};

export default RichTextEditorPage;

