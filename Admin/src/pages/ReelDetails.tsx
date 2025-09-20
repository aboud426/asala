import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  User,
  TrendingUp,
  TrendingDown,
  Languages as LanguagesIcon,
  AlertCircle,
  Edit,
  Loader2,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Play,
  Download,
  ExternalLink,
  ZoomIn,
  X,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useQuery } from '@tanstack/react-query';
import reelService, { ReelDto, MediaType } from '@/services/reelService';
import MediaPopup from '@/components/ui/media-popup';

const ReelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();

  // Media viewer state
  const [selectedMediaIndex, setSelectedMediaIndex] = React.useState<number | null>(null);
  const [isMediaPopupOpen, setIsMediaPopupOpen] = React.useState(false);


  // Fetch reel details
  const {
    data: reel,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reel', id],
    queryFn: () => reelService.getReelById(Number(id)),
    enabled: !!id,
  });

  // Get sorted media array
  const sortedMedia = React.useMemo(() => {
    if (!reel?.basePost?.postMedias) return [];
    return [...reel.basePost.postMedias].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [reel?.basePost?.postMedias]);

  const closeMediaViewer = React.useCallback(() => {
    setSelectedMediaIndex(null);
    setIsMediaPopupOpen(false);
  }, []);

  const goToNextMedia = React.useCallback(() => {
    if (selectedMediaIndex !== null && selectedMediaIndex < sortedMedia.length - 1) {
      setSelectedMediaIndex(selectedMediaIndex + 1);
    }
  }, [selectedMediaIndex, sortedMedia.length]);

  const goToPreviousMedia = React.useCallback(() => {
    if (selectedMediaIndex !== null && selectedMediaIndex > 0) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
  }, [selectedMediaIndex]);

  const handleMediaIndexChange = React.useCallback((index: number) => {
    if (index >= 0 && index < sortedMedia.length) {
      setSelectedMediaIndex(index);
    }
  }, [sortedMedia.length]);


  const handleBack = () => {
    navigate('/reels');
  };

  const handleEdit = () => {
    // For now, just show an alert since we don't have reel edit page yet
    alert(isRTL ? `تحرير ريل رقم ${id}` : `Edit reel #${id}`);
    // TODO: navigate(`/reels/${id}/edit`);
  };

  const handlePreview = () => {
    navigate(`/reels/${id}/preview`);
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
      {isActive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
    </Badge>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLocalizedDescription = (reel: ReelDto) => {
    if (isRTL && reel.basePost.localizations && reel.basePost.localizations.length > 0) {
      const arabicLocalization = reel.basePost.localizations.find(loc => loc.languageCode === 'ar');
      return arabicLocalization?.description || reel.basePost.description;
    }
    return reel.basePost.description;
  };

  const getMediaType = (url: string, mediaType?: MediaType): 'image' | 'video' | 'unknown' => {
    // First check if we have explicit MediaType
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

    // Fallback to extension check
    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const handleMediaClick = (index: number) => {
    if (sortedMedia[index]) {
      setSelectedMediaIndex(index);
      setIsMediaPopupOpen(true);
    }
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


  const MediaGallery: React.FC = () => {
    if (!sortedMedia || sortedMedia.length === 0) {
      return (
        <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد ملفات وسائط مرفقة' : 'No media files attached'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Media count badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="gap-2">
            <Video className="w-4 h-4" />
            {sortedMedia.length} {isRTL ? 'ملف' : 'files'}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {isRTL ? 'مرتبة حسب ترتيب العرض' : 'Sorted by display order'}
          </div>
        </div>

        {/* Grid layout for media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedMedia.map((media, index) => {
            const type = getMediaType(media.url, media.mediaType);
            const isVideo = type === 'video';

            return (
              <Card
                key={media.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 border-transparent hover:border-primary/20"
                onClick={() => handleMediaClick(index)}
              >
                <div className="relative aspect-square bg-muted/50">
                  {isVideo ? (
                    <>
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <Play className="w-6 h-6 text-primary fill-primary" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="gap-1">
                          <Video className="w-3 h-3" />
                          {isRTL ? 'فيديو' : 'Video'}
                        </Badge>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-primary/90">
                        #{index + 1}
                      </Badge>
                    </>
                  ) : type === 'image' ? (
                    <>
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                          <ZoomIn className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {isRTL ? 'صورة' : 'Image'}
                      </Badge>
                      <Badge className="absolute top-2 left-2 bg-primary/90">
                        #{index + 1}
                      </Badge>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <Badge className="absolute top-2 right-2">
                        {isRTL ? 'ملف' : 'File'}
                      </Badge>
                      <Badge className="absolute top-2 left-2 bg-primary/90">
                        #{index + 1}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {media.url.split('/').pop()?.split('.')[0] || `Media ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadMedia(media.url);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(media.url, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const InfoField: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }> = ({
    label,
    value,
    icon,
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm bg-muted/50 p-3 rounded-md border">
        {value || (isRTL ? 'غير محدد' : 'Not specified')}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Content Skeletons */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error instanceof Error ? error.message : (isRTL ? 'فشل في تحميل تفاصيل الريل' : 'Failed to load reel details')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-2"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (!reel) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>

          <div className="text-center py-8">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {isRTL ? 'الريل غير موجود' : 'Reel not found'}
            </h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'تفاصيل الريل' : 'Reel Details'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? `ريل #${reel.postId}`
                : `Reel #${reel.postId}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
            <Button variant="outline" onClick={handlePreview} className="gap-2">
              <Eye className="w-4 h-4" />
              {isRTL ? 'معاينة' : 'Preview'}
            </Button>
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>
          </div>
        </div>

        {/* Status and Quick Info */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center border border-border/20">
                    <Video className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{isRTL ? 'ريل' : 'Reel'}</span>
                      <Badge variant="outline">#{reel.postId}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'بواسطة مستخدم' : 'by User'} #{reel.basePost.userId}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(reel.basePost.isActive)}
                <Badge variant="outline" className="gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  {reel.basePost.numberOfReactions} {isRTL ? 'تفاعل' : 'reactions'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <LanguagesIcon className="w-3 h-3" />
                  {reel.basePost.localizations?.length || 0} {isRTL ? 'ترجمة' : 'translations'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Video className="w-3 h-3" />
                  {reel.basePost.postMedias?.length || 0} {isRTL ? 'ملف وسائط' : 'media files'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Gallery - Prominent position */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Video className="w-6 h-6 text-primary" />
              {isRTL ? 'ملفات الوسائط' : 'Media Gallery'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MediaGallery />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'معرف الريل' : 'Reel ID'}
                value={reel.postId.toString()}
                icon={<Video className="w-4 h-4" />}
              />
              <InfoField
                label={isRTL ? 'معرف المنشور' : 'Base Post ID'}
                value={reel.basePost.id.toString()}
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'المستخدم' : 'User'}
                value={
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{isRTL ? 'مستخدم' : 'User'} #{reel.basePost.userId}</span>
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'عدد التفاعلات' : 'Number of Reactions'}
                value={
                  <div className="flex items-center gap-2 text-lg font-semibold text-red-500">
                    <Heart className="w-5 h-5" />
                    {reel.basePost.numberOfReactions}
                  </div>
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'الحالة' : 'Status'}
                value={getStatusBadge(reel.basePost.isActive)}
              />
              <InfoField
                label={isRTL ? 'نوع المنشور' : 'Post Type'}
                value={
                  <Badge variant="outline">#{reel.basePost.postTypeId}</Badge>
                }
              />
            </div>

            <InfoField
              label={isRTL ? 'وصف الريل' : 'Reel Description'}
              value={
                <div className="bg-background p-4 rounded-lg border">
                  <p className="text-sm leading-relaxed">{getLocalizedDescription(reel)}</p>
                </div>
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(reel.basePost.createdAt)}
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'تاريخ التحديث' : 'Updated At'}
                value={
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(reel.basePost.updatedAt)}
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>


        {/* Original Description */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {isRTL ? 'المحتوى الأصلي' : 'Original Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-6 rounded-lg border">
              <p className="text-sm leading-relaxed">{reel.basePost.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Localizations */}
        {reel.basePost.localizations && reel.basePost.localizations.length > 0 && (
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isRTL ? 'الترجمات' : 'Localizations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reel.basePost.localizations.map((localization) => (
                <Card key={localization.id} className="border-2 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <LanguagesIcon className="w-4 h-4" />
                        {localization.languageCode}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        ID: {localization.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoField
                      label={isRTL ? 'المحتوى المترجم' : 'Localized Content'}
                      value={
                        <div className="bg-background p-4 rounded-lg border">
                          <p className="text-sm leading-relaxed">{localization.description}</p>
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Media Popup */}
        <MediaPopup
          isOpen={isMediaPopupOpen}
          onClose={closeMediaViewer}
          media={sortedMedia}
          currentIndex={selectedMediaIndex || 0}
          onNext={goToNextMedia}
          onPrevious={goToPreviousMedia}
          onIndexChange={handleMediaIndexChange}
        />
      </div>
    </DashboardLayout>
  );
};

export default ReelDetails;
