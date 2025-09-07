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
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useQuery } from '@tanstack/react-query';
import { postService, PostDto } from '@/services/postService';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();

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
      </div>
    </DashboardLayout>
  );
};

export default PostDetails;
