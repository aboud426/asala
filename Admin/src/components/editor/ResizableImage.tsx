import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
      setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType;
    };
  }
}

const ResizableImageComponent = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const { src, alt, title, width, height, align } = node.attrs;
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const startSize = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setAspectRatio(imgRef.current.naturalWidth / imgRef.current.naturalHeight);
    }
  }, [src]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const img = imgRef.current;
    if (!img) return;

    setIsResizing(true);
    startSize.current = {
      width: img.offsetWidth,
      height: img.offsetHeight,
      x: e.clientX,
      y: e.clientY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startSize.current.x;
      const newWidth = Math.max(100, startSize.current.width + deltaX);
      const newHeight = newWidth / aspectRatio;

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      setAspectRatio(imgRef.current.naturalWidth / imgRef.current.naturalHeight);
    }
  };

  const getWrapperStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'block',
      margin: '1rem 0',
    };

    if (width) {
      baseStyle.width = `${width}px`;
      baseStyle.maxWidth = '100%';
    }

    // Apply alignment
    if (align === 'center') {
      baseStyle.marginLeft = 'auto';
      baseStyle.marginRight = 'auto';
    } else if (align === 'right') {
      baseStyle.marginLeft = 'auto';
      baseStyle.marginRight = '0';
    } else {
      // left (default)
      baseStyle.marginLeft = '0';
      baseStyle.marginRight = 'auto';
    }

    return baseStyle;
  };

  return (
    <NodeViewWrapper 
      className="image-wrapper" 
      data-resizing={isResizing}
      data-align={align || 'left'}
      style={getWrapperStyle()}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        title={title || ''}
        width={width || undefined}
        height={height || undefined}
        onLoad={handleImageLoad}
        className={selected ? 'ProseMirror-selectednode' : ''}
        data-drag-handle
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          cursor: selected ? 'default' : 'grab',
        }}
      />
      {selected && (
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            background: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 10,
          }}
        />
      )}
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'image',

  group: 'block',

  draggable: true,

  addOptions() {
    return {
      inline: false,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return { src: attributes.src };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return { title: attributes.title };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      align: {
        default: 'left',
        parseHTML: (element) => {
          return element.getAttribute('data-align') || 'left';
        },
        renderHTML: (attributes) => {
          if (!attributes.align) {
            return {};
          }
          return { 'data-align': attributes.align };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { align });
        },
    };
  },
});

