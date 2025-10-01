import React, { useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  AtomicBlockUtils,
  ContentBlock,
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
} from "lucide-react";

export default function RichTextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [exportedHTML, setExportedHTML] = useState("");
  const { isRTL } = useDirection();
  const { theme } = useTheme();

  // Toggle inline styles (Bold, Italic, Underline, etc.)
  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Toggle block types (headers, lists, etc.)
  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Apply font size
  const toggleFontSize = (size: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    // Remove existing font sizes
    let newContentState = contentState;
    ["12", "14", "16", "18", "20", "24", "28", "32"].forEach((s) => {
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
  };

  // Add image
  const addImage = (file: File) => {
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
    };
    reader.readAsDataURL(file);
  };

  // Block renderer for images
  const mediaBlockRenderer = (block: ContentBlock) => {
    if (block.getType() === "atomic") {
      return {
        component: Media,
        editable: false,
      };
    }
    return null;
  };

  // Export to HTML
  const exportHTML = () => {
    const contentState = editorState.getCurrentContent();
    const html = stateToHTML(contentState, {
      inlineStyles: {
        "FONTSIZE-12": { style: { fontSize: "12px" } },
        "FONTSIZE-14": { style: { fontSize: "14px" } },
        "FONTSIZE-16": { style: { fontSize: "16px" } },
        "FONTSIZE-18": { style: { fontSize: "18px" } },
        "FONTSIZE-20": { style: { fontSize: "20px" } },
        "FONTSIZE-24": { style: { fontSize: "24px" } },
        "FONTSIZE-28": { style: { fontSize: "28px" } },
        "FONTSIZE-32": { style: { fontSize: "32px" } },
      },
      entityStyleFn: (entity) => {
        const entityType = entity.get("type").toLowerCase();
        if (entityType === "image") {
          const data = entity.getData();
          return {
            element: "img",
            attributes: {
              src: data.src,
              style: "max-width:100%;border-radius:8px;",
            },
          };
        }
      },
    });
    setExportedHTML(html);
  };

  // Clear editor
  const clearEditor = () => {
    setEditorState(EditorState.createEmpty());
    setExportedHTML("");
  };

  // Custom style function
  const customStyleFn = (styles: any) => {
    const style: React.CSSProperties = {};
    styles.forEach((s: string) => {
      if (s.startsWith("FONTSIZE-")) {
        const size = s.split("-")[1];
        style.fontSize = `${size}px`;
      }
    });
    return style;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rich Text Editor</h1>
          <p className="text-muted-foreground mt-2">
            Create and format content with our powerful rich text editor
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
              {/* Text Styles */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleInlineStyle("BOLD")}
                  className="h-9 w-9 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleInlineStyle("ITALIC")}
                  className="h-9 w-9 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleInlineStyle("UNDERLINE")}
                  className="h-9 w-9 p-0"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockType("header-one")}
                  title="Heading 1"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockType("header-two")}
                  title="Heading 2"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockType("header-three")}
                  title="Heading 3"
                >
                  H3
                </Button>
              </div>

              {/* Lists */}
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockType("unordered-list-item")}
                  className="h-9 w-9 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockType("ordered-list-item")}
                  className="h-9 w-9 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              {/* Font Size */}
              <div className="flex gap-1 border-r pr-2">
                <Select onValueChange={toggleFontSize}>
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
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])}
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
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={exportHTML}
                  className="h-9"
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
                "transition-colors"
              )}
              onClick={() => {
                // Focus the editor when clicking the container
                const editorElement = document.querySelector('.DraftEditor-root');
                if (editorElement) {
                  (editorElement as HTMLElement).focus();
                }
              }}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <Editor
                editorState={editorState}
                onChange={setEditorState}
                blockRendererFn={mediaBlockRenderer}
                customStyleFn={customStyleFn}
                placeholder="Start typing..."
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
                  className="p-4 border rounded-lg bg-muted/50 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: exportedHTML }}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              {/* Copy Button */}
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(exportedHTML);
                  // You can add a toast notification here if needed
                }}
                className="w-full"
              >
                Copy HTML to Clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
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

