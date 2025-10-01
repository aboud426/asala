import React, { useState, useRef, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  AtomicBlockUtils,
  ContentBlock,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDirection } from "@/contexts/DirectionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Bold,
  Italic,
  Underline,
  Type,
  Image as ImageIcon,
  Code,
  Download,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Quote,
  Strikethrough,
  Highlighter,
} from "lucide-react";

export default function RichTextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [exportedHTML, setExportedHTML] = useState("");
  const [currentFontSize, setCurrentFontSize] = useState("16");
  const { isRTL } = useDirection();
  const { theme } = useTheme();
  const editorRef = useRef<Editor>(null);

  // Get current inline style
  const currentStyle = editorState.getCurrentInlineStyle();
  
  // Get current block type
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  // Check if a style is active
  const isStyleActive = (style: string) => currentStyle.has(style);

  // Check if a block type is active
  const isBlockTypeActive = (type: string) => blockType === type;

  // Toggle inline styles (Bold, Italic, Underline, etc.)
  const toggleInlineStyle = useCallback((style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  }, [editorState]);

  // Toggle block types (headers, lists, etc.)
  const toggleBlockType = useCallback((blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  }, [editorState]);

  // Apply text alignment
  const applyAlignment = useCallback((alignment: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    
    // Get existing block data
    const blockData = block.getData();
    
    // Update block data with new alignment
    const newBlockData = blockData.merge({ textAlign: alignment });
    
    // Create new content state with updated block
    const newContentState = Modifier.setBlockData(
      contentState,
      selection,
      newBlockData
    );
    
    setEditorState(
      EditorState.push(editorState, newContentState, "change-block-data")
    );
  }, [editorState]);

  // Apply font size
  const toggleFontSize = useCallback((size: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    if (selection.isCollapsed()) {
      setCurrentFontSize(size);
      toast({
        title: "Font size set",
        description: `Font size ${size}px will be applied to new text`,
      });
      return;
    }
    
    // Remove existing font sizes
    let newContentState = contentState;
    ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"].forEach((s) => {
      newContentState = Modifier.removeInlineStyle(
        newContentState,
        selection,
        `FONTSIZE-${s}`
      );
    });
    
    // Apply new font size
    newContentState = Modifier.applyInlineStyle(
      newContentState,
      selection,
      `FONTSIZE-${size}`
    );
    
    setEditorState(
      EditorState.push(editorState, newContentState, "change-inline-style")
    );
    setCurrentFontSize(size);
    
    toast({
      title: "Font size applied",
      description: `Text size changed to ${size}px`,
    });
  }, [editorState]);

  // Handle undo
  const handleUndo = useCallback(() => {
    setEditorState(EditorState.undo(editorState));
  }, [editorState]);

  // Handle redo
  const handleRedo = useCallback(() => {
    setEditorState(EditorState.redo(editorState));
  }, [editorState]);

  // Add image
  const addImage = useCallback((file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "IMAGE",
        "IMMUTABLE",
        {
          src: e.target?.result,
        }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        EditorState.set(editorState, { currentContent: contentStateWithEntity }),
        entityKey,
        " "
      );
      setEditorState(newEditorState);
      
      toast({
        title: "Success",
        description: "Image added successfully",
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  }, [editorState]);

  // Block renderer for images
  const mediaBlockRenderer = useCallback((block: ContentBlock) => {
    if (block.getType() === "atomic") {
      return {
        component: Media,
        editable: false,
      };
    }
    return null;
  }, []);

  // Block style function for alignment
  const blockStyleFn = useCallback((block: ContentBlock) => {
    const blockData = block.getData();
    const textAlign = blockData.get("textAlign");
    if (textAlign) {
      return `text-align-${textAlign}`;
    }
    return "";
  }, []);

  // Export to HTML
  const exportHTML = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    
    if (!contentState.hasText()) {
      toast({
        title: "Warning",
        description: "Editor is empty. Please add some content first.",
        variant: "destructive",
      });
      return;
    }
    
    const html = stateToHTML(contentState, {
      inlineStyles: {
        BOLD: { element: "strong" },
        ITALIC: { element: "em" },
        UNDERLINE: { element: "u" },
        STRIKETHROUGH: { element: "s" },
        CODE: { element: "code" },
        "FONTSIZE-12": { style: { fontSize: "12px" } },
        "FONTSIZE-14": { style: { fontSize: "14px" } },
        "FONTSIZE-16": { style: { fontSize: "16px" } },
        "FONTSIZE-18": { style: { fontSize: "18px" } },
        "FONTSIZE-20": { style: { fontSize: "20px" } },
        "FONTSIZE-24": { style: { fontSize: "24px" } },
        "FONTSIZE-28": { style: { fontSize: "28px" } },
        "FONTSIZE-32": { style: { fontSize: "32px" } },
        "FONTSIZE-36": { style: { fontSize: "36px" } },
        "FONTSIZE-48": { style: { fontSize: "48px" } },
      },
      blockStyleFn: (block) => {
        const blockData = block.getData();
        const textAlign = blockData.get("textAlign");
        if (textAlign) {
          return {
            style: { textAlign },
          };
        }
      },
      entityStyleFn: (entity) => {
        const entityType = entity.get("type").toLowerCase();
        if (entityType === "image") {
          const data = entity.getData();
          return {
            element: "img",
            attributes: {
              src: data.src,
              style: "max-width:100%;border-radius:8px;display:block;margin:1em auto;",
            },
          };
        }
      },
    });
    
    setExportedHTML(html);
    toast({
      title: "Success",
      description: "Content exported to HTML successfully",
    });
  }, [editorState]);

  // Clear editor
  const clearEditor = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all content?")) {
      setEditorState(EditorState.createEmpty());
      setExportedHTML("");
      setCurrentFontSize("16");
      toast({
        title: "Cleared",
        description: "Editor content cleared",
      });
    }
  }, []);

  // Custom style function
  const customStyleFn = useCallback((styles: any) => {
    const style: React.CSSProperties = {};
    styles.forEach((s: string) => {
      if (s.startsWith("FONTSIZE-")) {
        const size = s.split("-")[1];
        style.fontSize = `${size}px`;
      }
    });
    return style;
  }, []);

  // Handle key commands
  const handleKeyCommand = useCallback((command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  }, []);

  // Focus editor
  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rich Text Editor</h1>
          <p className="text-muted-foreground mt-2">
            Create and format content with our powerful rich text editor. 
            Use keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+Z (Undo), Ctrl+Y (Redo)
          </p>
        </div>

        {/* Editor Card */}
        <Card>
          <CardHeader>
            <CardTitle>Content Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border">
              {/* Undo/Redo */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  className="h-9 w-9 p-0"
                  title="Undo (Ctrl+Z)"
                  disabled={editorState.getUndoStack().isEmpty()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  className="h-9 w-9 p-0"
                  title="Redo (Ctrl+Y)"
                  disabled={editorState.getRedoStack().isEmpty()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              {/* Text Styles */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant={isStyleActive("BOLD") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInlineStyle("BOLD")}
                  className="h-9 w-9 p-0"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isStyleActive("ITALIC") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInlineStyle("ITALIC")}
                  className="h-9 w-9 p-0"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isStyleActive("UNDERLINE") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInlineStyle("UNDERLINE")}
                  className="h-9 w-9 p-0"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isStyleActive("STRIKETHROUGH") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInlineStyle("STRIKETHROUGH")}
                  className="h-9 w-9 p-0"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isStyleActive("CODE") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInlineStyle("CODE")}
                  className="h-9 w-9 p-0"
                  title="Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </div>

              {/* Block Types */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant={isBlockTypeActive("header-one") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("header-one")}
                  title="Heading 1"
                  className="h-9"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant={isBlockTypeActive("header-two") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("header-two")}
                  title="Heading 2"
                  className="h-9"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant={isBlockTypeActive("header-three") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("header-three")}
                  title="Heading 3"
                  className="h-9"
                >
                  H3
                </Button>
                <Button
                  type="button"
                  variant={isBlockTypeActive("blockquote") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("blockquote")}
                  className="h-9 w-9 p-0"
                  title="Blockquote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant={isBlockTypeActive("unordered-list-item") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("unordered-list-item")}
                  className="h-9 w-9 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isBlockTypeActive("ordered-list-item") ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockType("ordered-list-item")}
                  className="h-9 w-9 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              {/* Text Alignment */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyAlignment("left")}
                  className="h-9 w-9 p-0"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyAlignment("center")}
                  className="h-9 w-9 p-0"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyAlignment("right")}
                  className="h-9 w-9 p-0"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Font Size */}
              <div className="flex gap-1 border-r pr-2">
                <Select onValueChange={toggleFontSize} value={currentFontSize}>
                  <SelectTrigger className="h-9 w-[110px]">
                    <Type className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                    <SelectItem value="28">28px</SelectItem>
                    <SelectItem value="32">32px</SelectItem>
                    <SelectItem value="36">36px</SelectItem>
                    <SelectItem value="48">48px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="h-9"
                  title="Upload Image (max 5MB)"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      addImage(e.target.files[0]);
                      e.target.value = ""; // Reset input
                    }
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-1 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearEditor}
                  className="h-9"
                  title="Clear all content"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={exportHTML}
                  className="h-9"
                  title="Export to HTML"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export HTML
                </Button>
              </div>
            </div>

            {/* Editor Area */}
            <div
              className={cn(
                "min-h-[400px] p-4 border rounded-lg cursor-text",
                "bg-background text-foreground",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                "transition-colors",
                "prose prose-sm max-w-none dark:prose-invert"
              )}
              onClick={focusEditor}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <Editor
                ref={editorRef}
                editorState={editorState}
                onChange={setEditorState}
                blockRendererFn={mediaBlockRenderer}
                blockStyleFn={blockStyleFn}
                customStyleFn={customStyleFn}
                handleKeyCommand={handleKeyCommand}
                placeholder="Start typing your content here..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Exported HTML Card */}
        {exportedHTML && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exported HTML</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExportedHTML("")}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* HTML Code */}
              <div>
                <label className="text-sm font-medium mb-2 block">HTML Code</label>
                <Textarea
                  value={exportedHTML}
                  readOnly
                  className="font-mono text-xs min-h-[200px]"
                  onClick={(e) => {
                    (e.target as HTMLTextAreaElement).select();
                  }}
                />
              </div>

              {/* Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preview</label>
                <div
                  className="p-4 border rounded-lg bg-muted/50 min-h-[200px] prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: exportedHTML }}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              {/* Copy Button */}
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(exportedHTML);
                  toast({
                    title: "Success",
                    description: "HTML copied to clipboard",
                  });
                }}
                className="w-full"
              >
                Copy HTML to Clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom CSS for text alignment */}
      <style>{`
        .text-align-left {
          text-align: left;
        }
        .text-align-center {
          text-align: center;
        }
        .text-align-right {
          text-align: right;
        }
        .text-align-justify {
          text-align: justify;
        }
        
        /* Draft.js editor styles */
        .DraftEditor-root {
          width: 100%;
        }
        
        .DraftEditor-editorContainer {
          min-height: 350px;
        }
        
        .public-DraftEditorPlaceholder-root {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }
        
        /* Blockquote styling */
        .public-DraftStyleDefault-blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        /* Code block styling */
        .public-DraftStyleDefault-pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        /* List styling */
        .public-DraftStyleDefault-ul,
        .public-DraftStyleDefault-ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .public-DraftStyleDefault-orderedListItem,
        .public-DraftStyleDefault-unorderedListItem {
          margin-bottom: 0.25rem;
        }
        
        /* Header styling */
        .public-DraftStyleDefault-h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .public-DraftStyleDefault-h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .public-DraftStyleDefault-h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </DashboardLayout>
  );
}

// Custom media renderer for images
const Media = (props: any) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { src } = entity.getData();
  
  return (
    <div className="flex justify-center my-4">
      <img
        src={src}
        alt=""
        className="max-w-full rounded-lg shadow-md"
        style={{ maxWidth: "100%", borderRadius: "8px" }}
      />
    </div>
  );
};

