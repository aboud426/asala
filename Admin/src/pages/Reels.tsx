import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Video,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Heart,
  User,
  ArrowUpDown,
  Clock,
  Calendar,
  Grid3X3,
  List,
  Play,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { ReelDto, PaginatedResult, MediaType } from '@/services/reelService';
import reelService from '@/services/reelService';

// Default placeholder video as data URI
const DEFAULT_REEL_IMAGE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgNUMzIDQgNCAzIDUgM0gxOUMyMCA0IDIxIDUgMjEgMTlDMjEgMjAgMjAgMjEgMTkgMjFINUMzIDIxIDIgMjAgMiAxOVY1WiIgc3Ryb2tlPSIjNjg3Nzg3IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTkgOEwxNSAxMkw5IDE2VjhaIiBmaWxsPSIjNjg3Nzg3Ii8+Cjwvc3ZnPgo=";

// Reel Media Component with error handling
const ReelMedia: React.FC<{ reel: ReelDto | null; size?: 'sm' | 'md' | 'lg' }> = ({ reel, size = 'sm' }) => {
  const [mediaError, setMediaError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Check if reel has video media
  const mediaToShow = (reel?.basePost.postMedias && reel.basePost.postMedias.length > 0 && !mediaError)
    ? reel.basePost.postMedias.find(m => m.mediaType === MediaType.Video)?.url || DEFAULT_REEL_IMAGE
    : DEFAULT_REEL_IMAGE;

  const isVideo = reel?.basePost.postMedias?.some(m => m.mediaType === MediaType.Video);

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center overflow-hidden border border-border/20 relative`}>
      {isVideo && !mediaError ? (
        <video
          src={mediaToShow}
          className="w-full h-full object-cover"
          onError={() => setMediaError(true)}
          muted
          playsInline
        />
      ) : (
        <img
          src={mediaToShow}
          alt={reel?.basePost.description || 'Reel'}
          className="w-full h-full object-cover"
          onError={() => setMediaError(true)}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Video className="w-4 h-4 text-white/80 drop-shadow-lg" />
      </div>
    </div>
  );
};

// Hover Preview Component for media cycling and video preview
const HoverPreview: React.FC<{
  reel: ReelDto;
  isHovered: boolean;
  onError: () => void;
}> = ({ reel, isHovered, onError }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaError, setMediaError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const medias = useMemo(() => reel.basePost.postMedias || [], [reel.basePost.postMedias]);
  const hasVideo = useMemo(() => medias.some(m => m.mediaType === MediaType.Video), [medias]);
  const currentMedia = medias[currentMediaIndex];

  useEffect(() => {
    if (isHovered && medias.length > 0) {
      if (hasVideo) {
        // If there's a video, play it
        const videoMedia = medias.find(m => m.mediaType === MediaType.Video);
        if (videoMedia) {
          const videoIndex = medias.findIndex(m => m.mediaType === MediaType.Video);
          setCurrentMediaIndex(videoIndex);
          // Small delay to ensure video element is rendered
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }, 100);
        }
      } else {
        // If only images, cycle through them every 5 seconds
        setCurrentMediaIndex(0);
        if (medias.length > 1) {
          intervalRef.current = setInterval(() => {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % medias.length);
          }, 1000);
        }
      }
    } else {
      // Reset when not hovered
      setCurrentMediaIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, medias, hasVideo]);

  const handleMediaError = () => {
    setMediaError(true);
    onError();
  };

  if (!currentMedia || mediaError) {
    return (
      <img
        src={DEFAULT_REEL_IMAGE}
        alt="Default reel"
        className="w-full h-full object-cover"
        onError={handleMediaError}
      />
    );
  }

  if (currentMedia.mediaType === MediaType.Video) {
    return (
      <video
        ref={videoRef}
        src={currentMedia.url}
        className="w-full h-full object-cover"
        onError={handleMediaError}
        muted
        playsInline
        loop
      />
    );
  } else {
    return (
      <img
        src={currentMedia.url}
        alt={reel.basePost.description}
        className="w-full h-full object-cover transition-opacity duration-500"
        onError={handleMediaError}
      />
    );
  }
};

// Reel Card Component for grid view - Instagram style
const ReelCard: React.FC<{
  reel: ReelDto;
  isRTL: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  size?: 'regular' | 'tall';
}> = ({ reel, isRTL, onView, onEdit, onDelete, size = 'regular' }) => {
  const [mediaError, setMediaError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mediaToShow = (reel.basePost.postMedias && reel.basePost.postMedias.length > 0 && !mediaError)
    ? reel.basePost.postMedias.find(m => m.mediaType === MediaType.Video)?.url ||
    reel.basePost.postMedias[0]?.url || DEFAULT_REEL_IMAGE
    : DEFAULT_REEL_IMAGE;

  const isVideo = reel.basePost.postMedias?.some(m => m.mediaType === MediaType.Video);

  const getLocalizedDescription = () => {
    if (isRTL && reel.basePost.localizations && reel.basePost.localizations.length > 0) {
      const arabicLocalization = reel.basePost.localizations.find(loc => loc.languageCode === 'ar');
      if (arabicLocalization) {
        return arabicLocalization.description;
      }
    }
    return reel.basePost.description;
  };

  return (
    <div
      className={`group cursor-pointer ${size === 'tall' ? 'row-span-2' : 'row-span-1'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Instagram-style media container with dynamic aspect ratio */}
      <div
        className={`relative bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg ${size === 'tall' ? 'aspect-[1/2]' : 'aspect-square'
          }`}
        onClick={() => onView(reel.postId)}
      >
        {isHovered && reel.basePost.postMedias && reel.basePost.postMedias.length > 0 ? (
          <HoverPreview
            reel={reel}
            isHovered={isHovered}
            onError={() => setMediaError(true)}
          />
        ) : (
          // Default thumbnail when not hovered
          isVideo && !mediaError ? (
            <video
              src={mediaToShow}
              className="w-full h-full object-cover"
              onError={() => setMediaError(true)}
              muted
              playsInline
            />
          ) : (
            <img
              src={mediaToShow}
              alt={getLocalizedDescription()}
              className="w-full h-full object-cover"
              onError={() => setMediaError(true)}
            />
          )
        )}

        {/* Instagram-like overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-1">
              <Heart className="w-6 h-6 fill-white" />
              <span className="font-semibold text-lg">
                {reel.basePost.numberOfReactions.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-6 h-6 fill-white" />
              <span className="font-semibold text-lg">
                {reel.basePost.postMedias?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Video indicator - Instagram style */}
        {isVideo && (
          <div className="absolute top-2 right-2">
            <Video className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        )}

        {/* Status indicator - small dot */}
        <div className="absolute top-2 left-2">
          <div className={`w-3 h-3 rounded-full ${reel.basePost.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>

        {/* Multiple files indicator */}
        {reel.basePost.postMedias && reel.basePost.postMedias.length > 1 && (
          <div className="absolute top-2 right-8">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(3, reel.basePost.postMedias.length) }, (_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-white rounded-full opacity-70" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instagram-style minimal info */}
      {/* <div className="pt-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {getLocalizedDescription().length > 30 
                ? getLocalizedDescription().substring(0, 30) + '...' 
                : getLocalizedDescription()
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              #{reel.postId} • {new Date(reel.basePost.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => onView(reel.postId)}>
                <Eye className="h-4 w-4 mr-2" />
                {isRTL ? 'عرض' : 'View'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(reel.postId)}>
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير' : 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(reel.postId)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isRTL ? 'حذف' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div> */}
    </div>
  );
};

const Reels: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'CreatedAt' | 'UpdatedAt' | 'NumberOfReactions'>('CreatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<ReelDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(14);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleCreateReel = () => {
    navigate('/reels/create');
  };

  const handleViewReel = (reelId: number) => {
    navigate(`/reels/${reelId}`);
  };

  const handleEditReel = (reelId: number) => {
    // For now, just show an alert since we don't have reel edit page yet
    alert(isRTL ? `تحرير ريل رقم ${reelId}` : `Edit reel #${reelId}`);
  };

  const handleDeleteReel = async (reelId: number) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الريل؟' : 'Are you sure you want to delete this reel?')) {
      // For now, just show an alert since we don't have delete functionality yet
      alert(isRTL ? `حذف ريل رقم ${reelId}` : `Delete reel #${reelId}`);
      // TODO: Implement delete functionality when backend supports it
    }
  };

  const fetchReels = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const result = await reelService.getReels({
        page,
        pageSize,
        activeOnly: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        description: searchTerm.trim() || undefined,
        sortBy,
        sortOrder
      });

      setPaginatedResult(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching reels');
      console.error('Failed to fetch reels:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchReels(1);
  }, [statusFilter, sortBy, sortOrder, fetchReels]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || currentPage === 1) {
        fetchReels(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchReels]);

  // Get current reels
  const reels = paginatedResult?.items || [];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (paginatedResult?.totalPages || 1)) {
      setCurrentPage(page);
      fetchReels(page);
    }
  };

  const handlePrevious = () => {
    if (paginatedResult?.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginatedResult?.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
        {isActive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getLocalizedDescription = (reel: ReelDto) => {
    if (isRTL && reel.basePost.localizations && reel.basePost.localizations.length > 0) {
      const arabicLocalization = reel.basePost.localizations.find(loc => loc.languageCode === 'ar');
      if (arabicLocalization) {
        return arabicLocalization.description;
      }
    }
    return reel.basePost.description;
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const handleSort = (field: 'CreatedAt' | 'UpdatedAt' | 'NumberOfReactions') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إدارة الريلز' : 'Reels Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة مقاطع الريلز والفيديوهات القصيرة' : 'Manage your reels and short video content'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReels(currentPage)}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Button onClick={handleCreateReel} className="gap-2">
              <Plus className="w-4 h-4" />
              {isRTL ? 'إضافة ريل جديد' : 'Add New Reel'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReels(currentPage)}
                disabled={loading}
                className="ml-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isRTL ? 'إعادة المحاولة' : 'Retry'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الريلز' : 'Total Reels'}
                  </p>
                  <p className="text-2xl font-bold">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      paginatedResult?.totalCount || 0
                    )}
                  </p>
                </div>
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'ريلز نشطة' : 'Active Reels'}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      reels.filter(r => r.basePost.isActive).length
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي التفاعلات' : 'Total Reactions'}
                  </p>
                  <p className="text-2xl font-bold text-pink-600">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      reels.reduce((total, reel) => total + reel.basePost.numberOfReactions, 0)
                    )}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'متوسط التفاعلات' : 'Avg Reactions'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      reels.length > 0
                        ? Math.round(reels.reduce((total, reel) => total + reel.basePost.numberOfReactions, 0) / reels.length)
                        : 0
                    )}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث في الريلز...' : 'Search reels...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'الحالة' : 'Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      {isRTL ? 'جميع الحالات' : 'All Status'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      {isRTL ? 'نشط' : 'Active'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      {sortBy === 'CreatedAt' && <Calendar className="h-4 w-4" />}
                      {sortBy === 'UpdatedAt' && <Clock className="h-4 w-4" />}
                      {sortBy === 'NumberOfReactions' && <Heart className="h-4 w-4" />}
                      {isRTL ? 'ترتيب حسب' : 'Sort by'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('CreatedAt')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('UpdatedAt')}>
                      <Clock className="h-4 w-4 mr-2" />
                      {isRTL ? 'تاريخ التحديث' : 'Updated Date'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('NumberOfReactions')}>
                      <Heart className="h-4 w-4 mr-2" />
                      {isRTL ? 'عدد التفاعلات' : 'Reactions Count'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reels Content - Grid or Table View */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                {isRTL ? `${reels.length} ريل` : `${reels.length} Reels`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-3 gap-4 auto-rows-fr">
                  {Array.from({ length: pageSize }, (_, index) => {
                    const patternIndex = index % 8;
                    const isTall = patternIndex === 2 || patternIndex === 5;

                    return (
                      <div key={index} className={`group cursor-pointer ${isTall ? 'row-span-2' : 'row-span-1'}`}>
                        <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${isTall ? 'aspect-[1/2]' : 'aspect-square'
                          }`}>
                          <Skeleton className="w-full h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : reels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Video className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {isRTL ? 'لا توجد ريلز' : 'No reels found'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isRTL ? 'ابدأ بإضافة أول ريل' : 'Get started by creating your first reel'}
                  </p>
                  <Button onClick={handleCreateReel} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {isRTL ? 'إضافة ريل جديد' : 'Add New Reel'}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 auto-rows-fr">
                  {reels.map((reel, index) => {
                    // Determine if this card should be tall based on the 8-card repeating pattern
                    const patternIndex = index % 8;
                    const isTall = patternIndex === 2 || patternIndex === 5;

                    return (
                      <ReelCard
                        key={reel.postId}
                        reel={reel}
                        isRTL={isRTL}
                        onView={handleViewReel}
                        onEdit={handleEditReel}
                        onDelete={handleDeleteReel}
                        size={isTall ? 'tall' : 'regular'}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Table View */
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                {isRTL ? `${reels.length} ريل` : `${reels.length} Reels`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table dir={isRTL ? 'rtl' : 'ltr'}>
                <TableHeader>
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الريل' : 'Reel'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المنشئ' : 'Creator'}</TableHead>
                    <TableHead
                      className={`${isRTL ? 'text-right' : 'text-left'} cursor-pointer hover:bg-muted/50`}
                      onClick={() => handleSort('NumberOfReactions')}
                    >
                      <div className="flex items-center gap-1">
                        {isRTL ? 'التفاعلات' : 'Reactions'}
                        {getSortIcon('NumberOfReactions')}
                      </div>
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead
                      className={`${isRTL ? 'text-right' : 'text-left'} cursor-pointer hover:bg-muted/50`}
                      onClick={() => handleSort('CreatedAt')}
                    >
                      <div className="flex items-center gap-1">
                        {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                        {getSortIcon('CreatedAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: pageSize }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    reels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Video className="w-12 h-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {isRTL ? 'لا توجد ريلز' : 'No reels found'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reels.map((reel) => (
                        <TableRow key={reel.postId} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                            <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                              <ReelMedia reel={reel} />
                              <div>
                                <p className="font-medium">{truncateText(getLocalizedDescription(reel), 60)}</p>
                                <p className="text-sm text-muted-foreground">#{reel.postId}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {reel.basePost.postMedias.length} {isRTL ? 'ملف' : 'files'}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="secondary" className="text-xs">
                                User #{reel.basePost.userId}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <span className="font-medium text-pink-600">{reel.basePost.numberOfReactions.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                            {getStatusBadge(reel.basePost.isActive)}
                          </TableCell>
                          <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                            <div className="text-sm">
                              <p className="font-medium">{formatDate(reel.basePost.createdAt)}</p>
                              {reel.basePost.createdAt !== reel.basePost.updatedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Updated: {formatDate(reel.basePost.updatedAt)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem
                                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                  onClick={() => handleViewReel(reel.postId)}
                                >
                                  <Eye className="h-4 w-4" />
                                  {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                  onClick={() => handleEditReel(reel.postId)}
                                >
                                  <Edit className="h-4 w-4" />
                                  {isRTL ? 'تحرير' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                  onClick={() => handleDeleteReel(reel.postId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {isRTL ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {paginatedResult && !loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRTL ? 'عرض' : 'Showing'} {((currentPage - 1) * pageSize) + 1} {isRTL ? 'إلى' : 'to'} {Math.min(currentPage * pageSize, paginatedResult.totalCount)} {isRTL ? 'من' : 'of'} {paginatedResult.totalCount} {isRTL ? 'ريل' : 'reels'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!paginatedResult.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4" />
                {isRTL ? 'السابق' : 'Previous'}
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'صفحة' : 'Page'} {currentPage} {isRTL ? 'من' : 'of'} {paginatedResult.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!paginatedResult.hasNextPage}
              >
                {isRTL ? 'التالي' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reels;
