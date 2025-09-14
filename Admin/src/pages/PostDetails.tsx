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
  MessageCircle,
  Globe,
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
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useQuery } from '@tanstack/react-query';
import { postService, PostDto } from '@/services/postService';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();

  // Media viewer state
  const [selectedMedia, setSelectedMedia] = React.useState<string | null>(null);
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | null>(null);

  // Keyboard navigation for media viewer
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedMedia) {
        if (event.key === 'Escape') {
          closeMediaViewer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia]);

  // Prevent body scroll when media viewer is open
  React.useEffect(() => {
    if (selectedMedia) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMedia]);

  // Fetch post details
  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(Number(id)),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/posts');
  };

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
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

  const getLocalizedDescription = (post: PostDto) => {
    if (isRTL) {
      const arabicLocalization = post.localizations.find(loc => loc.languageCode === 'ar');
      return arabicLocalization?.descriptionLocalized || post.description;
    }
    return post.description;
  };

  const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (!extension) return 'unknown';

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const handleMediaClick = (url: string) => {
    const type = getMediaType(url);
    if (type !== 'unknown') {
      setSelectedMedia(url);
      setMediaType(type);
    }
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
    setMediaType(null);
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

  // Media Components
  const MediaViewer: React.FC = () => {
    if (!selectedMedia || !mediaType) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeMediaViewer}
      >
        <div
          className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMediaViewer}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadMedia(selectedMedia)}
              className="bg-black/50 hover:bg-black/70 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              {isRTL ? 'تحميل' : 'Download'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(selectedMedia, '_blank')}
              className="bg-black/50 hover:bg-black/70 text-white gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {isRTL ? 'فتح' : 'Open'}
            </Button>
          </div>

          {mediaType === 'image' ? (
            <img
              src={selectedMedia}
              alt="Media viewer"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <video
              src={selectedMedia}
              controls
              className="max-w-full max-h-full rounded-lg"
              autoPlay
            />
          )}
        </div>
      </div>
    );
  };

  const MediaGallery: React.FC<{ mediaUrls: string[] }> = ({ mediaUrls }) => {
    if (!mediaUrls || mediaUrls.length === 0) {
      return (
        <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
            <ImageIcon className="w-4 h-4" />
            {mediaUrls.length} {isRTL ? 'ملف' : 'files'}
          </Badge>
        </div>

        {/* Grid layout for media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaUrls.map((url, index) => {
            const type = getMediaType(url);
            const isVideo = type === 'video';

            return (
              <Card
                key={index}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 border-transparent hover:border-primary/20"
                onClick={() => handleMediaClick(url)}
              >
                <div className="relative aspect-square bg-muted/50">
                  {isVideo ? (
                    <>
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <Play className="w-6 h-6 text-primary fill-primary" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 gap-1">
                        <Video className="w-3 h-3" />
                        {isRTL ? 'فيديو' : 'Video'}
                      </Badge>
                    </>
                  ) : type === 'image' ? (
                    <>
                      <img
                        src={url}
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
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <Badge className="absolute top-2 right-2">
                        {isRTL ? 'ملف' : 'File'}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {url.split('/').pop()?.split('.')[0] || `Media ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadMedia(url);
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
                          window.open(url, '_blank');
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
              <span>{error instanceof Error ? error.message : (isRTL ? 'فشل في تحميل تفاصيل المنشور' : 'Failed to load post details')}</span>
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

  if (!post) {
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
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {isRTL ? 'المنشور غير موجود' : 'Post not found'}
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
              {isRTL ? 'تفاصيل المنشور' : 'Post Details'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? `منشور #${post.id} - ${post.postTypeName}`
                : `Post #${post.id} - ${post.postTypeName}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
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
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border/20">
                    <MessageCircle className="w-8 h-8 text-primary/50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{isRTL ? 'منشور' : 'Post'}</span>
                      <Badge variant="outline">#{post.id}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {post.postTypeName} • {isRTL ? 'بواسطة مستخدم' : 'by User'} #{post.userId}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(post.isActive)}
                <Badge variant="outline" className="gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  {post.numberOfReactions} {isRTL ? 'تفاعل' : 'reactions'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <LanguagesIcon className="w-3 h-3" />
                  {post.localizations.length} {isRTL ? 'ترجمة' : 'translations'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {post.mediaUrls?.length || 0} {isRTL ? 'ملف وسائط' : 'media files'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'معرف المنشور' : 'Post ID'}
                value={post.id.toString()}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <InfoField
                label={isRTL ? 'نوع المنشور' : 'Post Type'}
                value={
                  <Badge variant="outline">{post.postTypeName}</Badge>
                }
                icon={<FileText className="w-4 h-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'المستخدم' : 'User'}
                value={
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{isRTL ? 'مستخدم' : 'User'} #{post.userId}</span>
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'عدد التفاعلات' : 'Number of Reactions'}
                value={
                  <div className="flex items-center gap-2 text-lg font-semibold text-red-500">
                    <Heart className="w-5 h-5" />
                    {post.numberOfReactions}
                  </div>
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'الحالة' : 'Status'}
                value={getStatusBadge(post.isActive)}
              />
              <InfoField
                label={isRTL ? 'الترجمات المتاحة' : 'Available Translations'}
                value={
                  <Badge variant="secondary">
                    {post.localizations.length} {isRTL ? 'ترجمة' : 'translations'}
                  </Badge>
                }
              />
            </div>

            <InfoField
              label={isRTL ? 'وصف المنشور' : 'Post Description'}
              value={
                <div className="bg-background p-4 rounded-lg border">
                  <p className="text-sm leading-relaxed">{getLocalizedDescription(post)}</p>
                </div>
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.createdAt)}
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'تاريخ التحديث' : 'Updated At'}
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.updatedAt)}
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Gallery */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {isRTL ? 'ملفات الوسائط' : 'Media Files'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MediaGallery mediaUrls={post.mediaUrls || []} />
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
              <p className="text-sm leading-relaxed">{post.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Localizations */}
        {post.localizations && post.localizations.length > 0 && (
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isRTL ? 'الترجمات' : 'Localizations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {post.localizations.map((localization) => (
                <Card key={localization.id} className="border-2 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <LanguagesIcon className="w-4 h-4" />
                        {localization.languageName} ({localization.languageCode})
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(localization.isActive)}
                        <Badge variant="outline" className="text-xs">
                          ID: {localization.id}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoField
                      label={isRTL ? 'المحتوى المترجم' : 'Localized Content'}
                      value={
                        <div className="bg-background p-4 rounded-lg border">
                          <p className="text-sm leading-relaxed">{localization.descriptionLocalized}</p>
                        </div>
                      }
                    />
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(localization.createdAt)}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'تاريخ التحديث:' : 'Updated:'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(localization.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Media Viewer Modal */}
        <MediaViewer />
      </div>
    </DashboardLayout>
  );
};

export default PostDetails;
