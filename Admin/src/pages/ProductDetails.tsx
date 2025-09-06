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
  Package,
  Image as ImageIcon,
  Globe,
  DollarSign,
  CheckCircle,
  XCircle,
  Languages as LanguagesIcon,
  AlertCircle,
  Edit,
  Loader2,
  Building,
  User,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useQuery } from '@tanstack/react-query';
import { productService, ProductDto } from '@/services/productService';

// Default placeholder image as data URI
const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMyA3VjE3QzMgMTguMTA0NiAzLjg5NTQzIDE5IDUgMTlIMTlDMjAuMTA0NiAxOSAyMSAxOC4xMDQ2IDIxIDE3VjdNMyA3QzMgNS44OTU0MyAzLjg5NTQzIDUgNSA1SDE5QzIwLjEwNDYgNSAyMSA1Ljg5NTQzIDIxIDdNMyA3SDIxTTkgMTNIMTUiIHN0cm9rZT0iIzY4Nzc4NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(Number(id)),
    enabled: !!id,
  });

  const handleBack = () => {
    navigate('/products');
  };

  const handleEdit = () => {
    navigate(`/products/${id}/edit`);
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

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        {isRTL ? 'نفد المخزون' : 'Out of Stock'}
      </Badge>;
    } else if (quantity < 20) {
      return <Badge variant="outline" className="gap-1 text-warning border-warning">
        <AlertCircle className="w-3 h-3" />
        {isRTL ? 'مخزون منخفض' : 'Low Stock'}
      </Badge>;
    }
    return <Badge variant="outline" className="gap-1 text-success border-success">
      <CheckCircle className="w-3 h-3" />
      {isRTL ? 'متوفر' : 'In Stock'}
    </Badge>;
  };

  const formatPrice = (price: number, currencyCode?: string, currencySymbol?: string) => {
    // If we have currency information, use it; otherwise fallback to USD
    const currency = currencyCode || 'USD';
    const symbol = currencySymbol || '$';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(price);
    } catch (error) {
      // If the currency code is not supported by Intl, use the symbol manually
      return `${symbol}${price.toFixed(2)}`;
    }
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
              <span>{error instanceof Error ? error.message : (isRTL ? 'فشل في تحميل تفاصيل المنتج' : 'Failed to load product details')}</span>
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

  if (!product) {
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
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {isRTL ? 'المنتج غير موجود' : 'Product not found'}
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
              {isRTL && product.localizedName ? product.localizedName : product.name}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'تفاصيل المنتج ومعلوماته التجارية'
                : 'Product details and business information'}
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
                  {product.images && product.images.length > 0 ? (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border border-border/20">
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border/20">
                      <Package className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{isRTL && product.localizedName ? product.localizedName : product.name}</span>
                      <Badge variant="outline">#{product.id}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL && product.localizedDescription ? product.localizedDescription : product.description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(product.isActive)}
                {getStockStatus(product.quantity)}
                <Badge variant="outline" className="gap-1">
                  <LanguagesIcon className="w-3 h-3" />
                  {product.localizations.length} {isRTL ? 'ترجمة' : 'translations'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'معرف المنتج' : 'Product ID'}
                value={product.id.toString()}
                icon={<Package className="w-4 h-4" />}
              />
              <InfoField
                label={isRTL ? 'اسم المنتج' : 'Product Name'}
                value={product.name}
                icon={<Package className="w-4 h-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'الفئة' : 'Category'}
                value={
                  product.categoryName ? (
                    <Badge variant="outline">{product.categoryName}</Badge>
                  ) : (
                    isRTL ? 'غير محدد' : 'Not specified'
                  )
                }
              />
              <InfoField
                label={isRTL ? 'المزود' : 'Provider'}
                value={
                  product.providerName ? (
                    <Badge variant="secondary">{product.providerName}</Badge>
                  ) : (
                    isRTL ? 'غير محدد' : 'Not specified'
                  )
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'السعر' : 'Price'}
                value={
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <DollarSign className="w-5 h-5" />
                    {formatPrice(product.price, product.currencyCode, product.currencySymbol)}
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'العملة' : 'Currency'}
                value={`${product.currencySymbol} ${product.currencyCode} - ${product.currencyName}`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'الكمية المتاحة' : 'Available Quantity'}
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.quantity}</span>
                    {getStockStatus(product.quantity)}
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'الحالة' : 'Status'}
                value={getStatusBadge(product.isActive)}
              />
            </div>

            <InfoField
              label={isRTL ? 'الوصف' : 'Description'}
              value={product.description}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InfoField
                label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                }
              />
              <InfoField
                label={isRTL ? 'تاريخ التحديث' : 'Updated At'}
                value={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        {product.images && product.images.length > 0 && (
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {isRTL ? 'الصور' : 'Images'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {product.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={image.url}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
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
        {product.localizations && product.localizations.length > 0 && (
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {isRTL ? 'الترجمات' : 'Localizations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.localizations.map((localization) => (
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
                      label={isRTL ? 'اسم المنتج المترجم' : 'Localized Product Name'}
                      value={localization.nameLocalized}
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

export default ProductDetails;
