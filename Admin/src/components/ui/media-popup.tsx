import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { Badge } from './badge';
import { useDirection } from '@/contexts/DirectionContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface MediaItem {
  id: number;
  url: string;
  mediaType?: number;
}

interface MediaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  currentIndex: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onIndexChange?: (index: number) => void;
}

const MediaPopup: React.FC<MediaPopupProps> = ({
  isOpen,
  onClose,
  media,
  currentIndex,
  onNext,
  onPrevious,
  onIndexChange,
}) => {
  const { isRTL } = useDirection();
  const [imageScale, setImageScale] = React.useState(1);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Reset zoom when media changes
  React.useEffect(() => {
    setImageScale(1);
    setIsZoomed(false);
  }, [currentIndex]);

  // Prevent body scroll when popup is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Zoom handlers
  const handleZoomIn = React.useCallback(() => {
    setImageScale(prev => Math.min(prev * 1.25, 3));
    setIsZoomed(true);
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setImageScale(prev => {
      const newScale = Math.max(prev * 0.8, 0.5);
      setIsZoomed(newScale > 1);
      return newScale;
    });
  }, []);

  const handleResetZoom = React.useCallback(() => {
    setImageScale(1);
    setIsZoomed(false);
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (!isRTL && onPrevious) {
            onPrevious();
          } else if (isRTL && onNext) {
            onNext();
          }
          break;
        case 'ArrowRight':
          if (!isRTL && onNext) {
            onNext();
          } else if (isRTL && onPrevious) {
            onPrevious();
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRTL, onClose, onNext, onPrevious, handleZoomIn, handleZoomOut, handleResetZoom]);

  const getMediaType = (url: string, mediaType?: number): 'image' | 'video' | 'unknown' => {
    // Check MediaType enum if available
    if (mediaType !== undefined) {
      switch (mediaType) {
        case 1: // MediaType.Image
          return 'image';
        case 2: // MediaType.Video
          return 'video';
        default:
          return 'unknown';
      }
    }

    // Fallback to extension check
    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const downloadMedia = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'media';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !media.length || !media[currentIndex]) {
    return null;
  }

  const currentMedia = media[currentIndex];
  const mediaType = getMediaType(currentMedia.url, currentMedia.mediaType);
  const hasNext = currentIndex < media.length - 1;
  const hasPrevious = currentIndex > 0;
  const isImage = mediaType === 'image';

  const popupContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={handleOverlayClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Modal Container */}
      <div className="relative bg-background rounded-lg sm:rounded-xl shadow-2xl max-w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full flex flex-col overflow-hidden mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Badge variant="outline" className="text-xs sm:text-sm shrink-0">
              {currentIndex + 1} / {media.length}
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentMedia.url.split('/').pop()?.split('.')[0] || `Media ${currentIndex + 1}`}
            </span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Zoom controls for images */}
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={imageScale <= 0.5}
                  className="gap-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={imageScale >= 3}
                  className="gap-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                {isZoomed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetZoom}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                )}
              </>
            )}
            
            {/* Download button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadMedia(currentMedia.url)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            {/* External link button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(currentMedia.url, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex-1 relative overflow-hidden bg-muted/20 flex items-center justify-center min-h-0">
          {/* Navigation Arrows */}
          {hasPrevious && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg w-8 h-8 sm:w-10 sm:h-10"
              onClick={onPrevious}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          
          {hasNext && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg w-8 h-8 sm:w-10 sm:h-10"
              onClick={onNext}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}

          {/* Media Display */}
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            {mediaType === 'image' ? (
              <div 
                className="relative max-w-full max-h-full overflow-auto"
                style={{ 
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <img
                  src={currentMedia.url}
                  alt={`Media ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            ) : mediaType === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay={false}
                className="max-w-full max-h-full rounded-lg"
                style={{ 
                  maxHeight: 'calc(95vh - 120px)',
                  maxWidth: '100%'
                }}
              >
                {isRTL ? 'متصفحك لا يدعم عرض الفيديو' : 'Your browser does not support the video tag.'}
              </video>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'لا يمكن عرض هذا النوع من الملفات' : 'Cannot preview this file type'}
                </p>
                <Button
                  onClick={() => window.open(currentMedia.url, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {isRTL ? 'فتح في نافذة جديدة' : 'Open in new tab'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with navigation info */}
        {media.length > 1 && (
          <div className="p-3 border-t bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onIndexChange?.(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground hidden sm:block">
        <div className="flex flex-col gap-1">
          <div>ESC: {isRTL ? 'إغلاق' : 'Close'}</div>
          <div>←→: {isRTL ? 'التنقل' : 'Navigate'}</div>
          {isImage && <div>+/-: {isRTL ? 'تكبير/تصغير' : 'Zoom'}</div>}
        </div>
      </div>
    </div>
  );

  // Use portal to render outside the normal DOM tree
  return createPortal(popupContent, document.body);
};

export default MediaPopup;
