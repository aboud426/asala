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
  Store,
  Star,
  Image as ImageIcon,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Languages as LanguagesIcon,
  AlertCircle,
  Edit,
  Loader2,
  Building,
  User,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useQuery } from '@tanstack/react-query';
import { providerService, Provider } from '@/services/providerService';

const ProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();

  // Fetch provider details
  const {
    data: provider,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getById(Number(id)),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/providers');
  };

  const handleEdit = () => {
    navigate(`/providers/${id}/edit`);
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'} className="gap-1">
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
    </Badge>
  );

  const getRatingStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
    </div>
  );

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
              <span>{error instanceof Error ? error.message : 'Failed to load provider details'}</span>
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

  if (!provider) {
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
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {isRTL ? 'مقدم الخدمة غير موجود' : 'Provider not found'}
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
              {provider.businessName}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'تفاصيل مقدم الخدمة ومعلوماته التجارية'
                : 'Provider details and business information'}
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{provider.businessName}</span>
                </div>
                {getStatusBadge(provider.isActive)}
              </div>
              <div className="flex items-center gap-4">
                {getRatingStars(provider.rating)}
                <Badge variant="outline" className="gap-1">
                  <LanguagesIcon className="w-3 h-3" />
                  {provider.localizations.length} {isRTL ? 'ترجمة' : 'translations'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {isRTL ? 'معلومات المستخدم' : 'User Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'معرف المستخدم' : 'User ID'}
                value={provider.userId.toString()}
                icon={<User className="w-4 h-4" />}
              />
              <InfoField
                label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                value={
                  provider.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {provider.email}
                    </div>
                  ) : (
                    isRTL ? 'غير محدد' : 'Not specified'
                  )
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                value={
                  provider.phoneNumber ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {provider.phoneNumber}
                    </div>
                  ) : (
                    isRTL ? 'غير محدد' : 'Not specified'
                  )
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                value={new Date(provider.createdAt).toLocaleDateString()}
              />
              <InfoField
                label={isRTL ? 'تاريخ التحديث' : 'Updated At'}
                value={new Date(provider.updatedAt).toLocaleDateString()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {isRTL ? 'معلومات الأعمال' : 'Business Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'اسم الشركة' : 'Business Name'}
                value={provider.businessName}
                icon={<Store className="w-4 h-4" />}
              />
              <InfoField
                label={isRTL ? 'التقييم' : 'Rating'}
                value={getRatingStars(provider.rating)}
                icon={<Star className="w-4 h-4" />}
              />
            </div>

            <InfoField
              label={isRTL ? 'الوصف' : 'Description'}
              value={provider.description}
            />

            <InfoField
              label={isRTL ? 'الشركة الأم' : 'Parent Company'}
              value={provider.parentBusinessName || (isRTL ? 'لا يوجد' : 'None')}
              icon={<Building className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        {/* Images */}
        {provider.images && provider.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {isRTL ? 'الصور' : 'Images'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {provider.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={image.url}
                        alt={`${provider.businessName} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full">
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      {image.url}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Localizations */}
        {provider.localizations && provider.localizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isRTL ? 'الترجمات' : 'Localizations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {provider.localizations.map((localization) => (
                <Card key={localization.id} className="border-2 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <LanguagesIcon className="w-4 h-4" />
                        {localization.languageName} ({localization.languageCode})
                      </h4>
                      {getStatusBadge(localization.isActive)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoField
                      label={isRTL ? 'اسم الشركة المترجم' : 'Localized Business Name'}
                      value={localization.businessNameLocalized}
                    />
                    <InfoField
                      label={isRTL ? 'الوصف المترجم' : 'Localized Description'}
                      value={localization.descriptionLocalized}
                    />
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                        <span className="ml-2">{new Date(localization.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'تاريخ التحديث:' : 'Updated:'}</span>
                        <span className="ml-2">{new Date(localization.updatedAt).toLocaleDateString()}</span>
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

export default ProviderDetails;
