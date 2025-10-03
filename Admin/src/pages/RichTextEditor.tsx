import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Eye } from 'lucide-react';

const RichTextEditorPage = () => {
  const [content, setContent] = useState<string>(`
    <h1>Welcome to the Rich Text Editor</h1>
    <p>This is a powerful <strong>Notion-like editor</strong> built with <em>Tiptap</em>.</p>
    
    <h2>Features</h2>
    <ul>
      <li>Rich text formatting (bold, italic, underline, strikethrough)</li>
      <li>Multiple heading levels</li>
      <li>Lists (bullet, ordered, and task lists)</li>
      <li>Tables with resizable columns</li>
      <li>Code blocks and inline code</li>
      <li>Blockquotes</li>
      <li>Images and links</li>
      <li>Text alignment</li>
      <li>Syntax highlighting</li>
      <li>Typography enhancements</li>
    </ul>

    <h3>Try the Task List</h3>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="true">Create the editor</li>
      <li data-type="taskItem" data-checked="true">Add all features</li>
      <li data-type="taskItem" data-checked="false">Use it in your project</li>
    </ul>

    <blockquote>
      <p>Use the toolbar above to format and style your content!</p>
    </blockquote>

    <h3>Code Example</h3>
    <pre><code>const editor = useEditor({
  extensions: [StarterKit, Placeholder, Table],
  content: '&lt;p&gt;Hello World!&lt;/p&gt;',
});</code></pre>
  `);

  const [showPreview, setShowPreview] = useState(false);

  const handleClear = () => {
    setContent('');
  };

  const handleLoadSample = () => {
    setContent(`
      <h1>Sample Document</h1>
      <p>This is a sample document with various formatting options.</p>
      
      <h2>Table Example</h2>
      <table>
        <tr>
          <th>Feature</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
        <tr>
          <td>Rich Text</td>
          <td>Complete</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Tables</td>
          <td>Complete</td>
          <td>Medium</td>
        </tr>
        <tr>
          <td>Images</td>
          <td>Complete</td>
          <td>Low</td>
        </tr>
      </table>
    `);
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" onClick={handleLoadSample}>
              Load Sample
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
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
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </ScrollArea>
                ) : (
                  <RichTextEditor
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
                  The generated HTML from your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{content}</code>
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
              <h3 className="font-semibold mb-2">Toolbar Features</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Use the toolbar buttons to format text, add headings, lists, and more</li>
                <li>Click the table icon to insert a 3x3 table</li>
                <li>Click the image icon to add an image by URL</li>
                <li>Click the link icon to add hyperlinks to selected text</li>
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

