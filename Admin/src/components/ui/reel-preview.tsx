import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDirection } from '@/contexts/DirectionContext';
import reelService, { ReelDto, MediaType } from '@/services/reelService';
import { Button } from './button';
import { Badge } from './badge';
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Volume2,
  VolumeX,
  Heart,
  Share,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';

interface ReelPreviewProps {
  reelId?: string;
  reel?: ReelDto;
  onClose?: () => void;
}

const ReelPreview: React.FC<ReelPreviewProps> = ({ reelId: propReelId, reel: propReel, onClose }) => {
  const { id: paramReelId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  
  const reelId = propReelId || paramReelId;
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isHolding, setIsHolding] = React.useState(false);
  
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Fetch reel data if not provided
  const { data: fetchedReel, isLoading, error } = useQuery({
    queryKey: ['reel', reelId],
    queryFn: () => reelService.getReelById(Number(reelId)),
    enabled: !!reelId && !propReel,
  });

  const reel = propReel || fetchedReel;
  
  // Get sorted media array
  const sortedMedia = React.useMemo(() => {
    if (!reel?.basePost?.postMedias) return [];
    return [...reel.basePost.postMedias].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [reel?.basePost?.postMedias]);

  const currentMedia = sortedMedia[currentMediaIndex];
  const totalMedia = sortedMedia.length;

  const getMediaType = (url: string, mediaType?: number): 'image' | 'video' | 'unknown' => {
    if (mediaType !== undefined) {
      switch (mediaType) {
        case MediaType.Image:
          return 'image';
        case MediaType.Video:
          return 'video';
        default:
          return 'unknown';
      }
    }

    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const currentMediaType = currentMedia ? getMediaType(currentMedia.url, currentMedia.mediaType) : 'unknown';

  const handleNextMedia = React.useCallback(() => {
    if (currentMediaIndex < totalMedia - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    } else {
      // Loop back to first media or close
      setCurrentMediaIndex(0);
    }
  }, [currentMediaIndex, totalMedia]);

  const handlePreviousMedia = React.useCallback(() => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    } else {
      setCurrentMediaIndex(totalMedia - 1);
    }
  }, [currentMediaIndex, totalMedia]);

  // Progress timer for images (videos handle their own progress)
  React.useEffect(() => {
    if (!isPlaying || isPaused || isHolding || currentMediaType === 'video') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // For images, show for 5 seconds
    const duration = 5000;
    const interval = 50; // Update every 50ms for smooth progress
    let elapsed = progress * duration;

    intervalRef.current = setInterval(() => {
      elapsed += interval;
      const newProgress = elapsed / duration;
      
      if (newProgress >= 1) {
        setProgress(1);
        handleNextMedia();
      } else {
        setProgress(newProgress);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isPaused, isHolding, currentMediaIndex, currentMediaType, progress, handleNextMedia]);

  // Handle video progress
  React.useEffect(() => {
    if (currentMediaType === 'video' && videoRef.current && isPlaying && !isPaused && !isHolding) {
      const video = videoRef.current;
      
      const updateProgress = () => {
        if (video.duration && video.currentTime) {
          setProgress(video.currentTime / video.duration);
        }
      };

      const handleVideoEnd = () => {
        setProgress(1);
        handleNextMedia();
      };

      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [currentMediaType, isPlaying, isPaused, isHolding, handleNextMedia]);

  // Reset progress when media changes
  React.useEffect(() => {
    setProgress(0);
  }, [currentMediaIndex]);

  // Auto-play/pause videos
  React.useEffect(() => {
    if (currentMediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      if (isPlaying && !isPaused && !isHolding) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  }, [isPlaying, isPaused, isHolding, currentMediaType]);

  const handleMediaClick = () => {
    handleNextMedia();
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    holdTimeoutRef.current = setTimeout(() => {
      setIsPaused(true);
    }, 200); // Small delay to distinguish from tap
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isPaused) {
      setIsPaused(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/reels');
    }
  };

  const getLocalizedDescription = (reel: ReelDto) => {
    if (isRTL && reel.basePost.localizations && reel.basePost.localizations.length > 0) {
      const arabicLocalization = reel.basePost.localizations.find(loc => loc.languageCode === 'ar');
      return arabicLocalization?.description || reel.basePost.description;
    }
    return reel.basePost.description;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !reel || !sortedMedia.length) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">
            {error 
              ? (error instanceof Error ? error.message : (isRTL ? 'حدث خطأ' : 'An error occurred'))
              : (isRTL ? 'لم يتم العثور على محتوى' : 'No content found')
            }
          </p>
          <Button variant="secondary" onClick={handleClose}>
            {isRTL ? 'العودة' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex gap-1">
          {sortedMedia.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: index < currentMediaIndex 
                    ? '100%' 
                    : index === currentMediaIndex 
                    ? `${progress * 100}%` 
                    : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-12 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h3 className="font-medium">
                {isRTL ? 'ريل' : 'Reel'} #{reel.postId}
              </h3>
              <p className="text-sm text-white/80">
                {isRTL ? 'المستخدم' : 'User'} #{reel.basePost.userId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentMediaType === 'video' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer select-none"
        onClick={handleMediaClick}
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {currentMediaType === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`Media ${currentMediaIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        ) : currentMediaType === 'video' ? (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="max-w-full max-h-full object-contain"
            muted={isMuted}
            playsInline
            onLoadedData={() => {
              if (videoRef.current && isPlaying) {
                videoRef.current.play().catch(console.error);
              }
            }}
          />
        ) : (
          <div className="text-center">
            <p className="text-white/70 mb-4">
              {isRTL ? 'لا يمكن عرض هذا النوع من الملفات' : 'Cannot preview this file type'}
            </p>
            <Button
              variant="secondary"
              onClick={() => window.open(currentMedia.url, '_blank')}
            >
              {isRTL ? 'فتح الملف' : 'Open File'}
            </Button>
          </div>
        )}

        {/* Navigation arrows for larger screens */}
        <div className="absolute inset-y-0 left-0 items-center pl-4 opacity-0 hover:opacity-100 transition-opacity hidden lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousMedia();
            }}
            className="text-white hover:bg-white/20 w-10 h-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="absolute inset-y-0 right-0 items-center pr-4 opacity-0 hover:opacity-100 transition-opacity hidden lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleNextMedia();
            }}
            className="text-white hover:bg-white/20 w-10 h-10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="space-y-3">
          {/* Description */}
          <div className="text-sm">
            <p className="leading-relaxed">
              {getLocalizedDescription(reel)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">{reel.basePost.numberOfReactions}</span>
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-white border-white/30 bg-black/30">
                {currentMediaIndex + 1} / {totalMedia}
              </Badge>
              <button className="text-white/80 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pause indicator */}
      {(isPaused || isHolding) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-6">
            <Pause className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelPreview;
