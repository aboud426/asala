import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Eye,
    Star,
    MapPin,
    Calendar,
    Package,
    DollarSign,
    ImageOff,
    AlertCircle,
    Share2,
    MessageCircle,
    ThumbsUp,
    Bookmark,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import productsPagesService, { ProductsPages as ProductsPagesType } from '@/services/productsPagesService';
import productService, { ProductDto } from '@/services/productService';
import { useIntersection } from '@/hooks/useIntersection';

interface ProductCardProps {
    product: ProductDto;
    isRTL: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isRTL }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const nextImage = () => {
        if (product.mediaUrls && product.mediaUrls.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % product.mediaUrls!.length);
        }
    };

    const prevImage = () => {
        if (product.mediaUrls && product.mediaUrls.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? product.mediaUrls!.length - 1 : prev - 1
            );
        }
    };

    const formatPrice = (price: number, symbol: string) => {
        return isRTL ? `${price} ${symbol}` : `${symbol}${price}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
    };

    return (
        <Card className="w-full max-w-lg mx-auto border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            {/* Product Header (like Facebook post header) */}
            <div className={`p-4 border-b border-gray-100 dark:border-gray-800 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1">
                        {product.localizedName || product.name}
                    </h3>
                    <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <MapPin className="h-3 w-3" />
                        <span>{product.providerName}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(product.createdAt)}</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Product Description */}
            {(product.localizedDescription || product.description) && (
                <div className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                        {product.localizedDescription || product.description}
                    </p>
                </div>
            )}

            {/* Product Image Gallery */}
            <div className="relative bg-gray-50 dark:bg-gray-800 aspect-square">
                {product.mediaUrls && product.mediaUrls.length > 0 && !imageError ? (
                    <>
                        <img
                            src={product.mediaUrls[currentImageIndex]}
                            alt={product.localizedName || product.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                        
                        {/* Image navigation for multiple images */}
                        {product.mediaUrls.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-full p-2 ${isRTL ? 'right-2' : 'left-2'}`}
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-full p-2 ${isRTL ? 'left-2' : 'right-2'}`}
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                
                                {/* Image indicator dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                    {product.mediaUrls.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                index === currentImageIndex 
                                                    ? 'bg-white shadow-lg' 
                                                    : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <ImageOff className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isRTL ? 'لا توجد صورة' : 'No image'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
                {/* Price and Category */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(product.price, product.currencySymbol)}
                        </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {product.categoryName}
                    </Badge>
                </div>

                {/* Stock Info */}
                <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Package className="h-4 w-4" />
                    <span>
                        {product.quantity > 0 
                            ? `${product.quantity} ${isRTL ? 'قطعة متاحة' : 'in stock'}`
                            : (isRTL ? 'غير متاح' : 'Out of stock')
                        }
                    </span>
                </div>

                {/* Social Actions (like Facebook post) */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                                <Heart className="h-4 w-4" />
                                <span className={isRTL ? 'mr-1' : 'ml-1'}>
                                    {isRTL ? 'إعجاب' : 'Like'}
                                </span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                <MessageCircle className="h-4 w-4" />
                                <span className={isRTL ? 'mr-1' : 'ml-1'}>
                                    {isRTL ? 'تعليق' : 'Comment'}
                                </span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400">
                                <Share2 className="h-4 w-4" />
                                <span className={isRTL ? 'mr-1' : 'ml-1'}>
                                    {isRTL ? 'مشاركة' : 'Share'}
                                </span>
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg"
                    disabled={product.quantity === 0}
                >
                    <ShoppingCart className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {product.quantity === 0 
                        ? (isRTL ? 'غير متاح' : 'Out of Stock')
                        : (isRTL ? 'أضف إلى السلة' : 'Add to Cart')
                    }
                </Button>
            </div>
        </Card>
    );
};

const ProductCardSkeleton: React.FC = () => {
    return (
        <Card className="w-full max-w-lg mx-auto border-0 shadow-lg rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
            </div>
            <div className="px-4 py-3">
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </Card>
    );
};

const ProductsPageViewer: React.FC = () => {
    const { isRTL } = useDirection();
    const { id } = useParams<{ id: string }>();
    const productsPagesId = id ? parseInt(id) : 0;

    // Query for products page info
    const { data: productsPageData, isLoading: isLoadingPage } = useQuery({
        queryKey: ['productsPages', productsPagesId],
        queryFn: () => productsPagesService.getProductsPagesById(productsPagesId),
        enabled: productsPagesId > 0,
    });

    // Infinite query for products with cursor pagination
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingProducts,
        error
    } = useInfiniteQuery({
        queryKey: ['products-by-page', productsPagesId],
        queryFn: ({ pageParam }) => 
            productService.getProductsByPageWithCursor({
                productsPagesId,
                cursor: pageParam,
                pageSize: 6, // Load 6 products at a time
            }),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        enabled: productsPagesId > 0,
    });

    // Intersection observer for infinite scroll
    const { ref, isIntersecting } = useIntersection({
        threshold: 1.0,
    });

    // Trigger loading more products when sentinel comes into view
    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Flatten products from all pages
    const allProducts = data?.pages.flatMap(page => page.items) || [];

    const handleBackClick = () => {
        window.history.back();
    };

    if (isLoadingPage) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!productsPageData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'صفحة غير موجودة' : 'Page Not Found'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                        {isRTL ? 'صفحة المنتجات المطلوبة غير متاحة' : 'The requested products page is not available'}
                    </p>
                    <Button onClick={handleBackClick} variant="outline">
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'العودة' : 'Go Back'}
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleBackClick}
                        className="shrink-0"
                    >
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                        {isRTL ? 'العودة' : 'Back'}
                    </Button>
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h1 className="text-3xl font-bold text-foreground">
                            {productsPageData.name}
                        </h1>
                        {productsPageData.description && (
                            <p className="text-muted-foreground mt-1">
                                {productsPageData.description}
                            </p>
                        )}
                        <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Badge variant="outline" className="text-xs">
                                {productsPageData.includedProductTypes.length} {isRTL ? 'فئة' : 'categories'}
                            </Badge>
                            <Badge variant={productsPageData.isActive ? 'default' : 'secondary'} className="text-xs">
                                {isRTL ? (productsPageData.isActive ? 'نشط' : 'غير نشط') : (productsPageData.isActive ? 'Active' : 'Inactive')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="border-secondary/20 bg-secondary/10 dark:bg-secondary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-secondary-foreground" />
                                <div>
                                    <h3 className="font-medium text-secondary-foreground dark:text-secondary-foreground">
                                        {isRTL ? 'خطأ في تحميل المنتجات' : 'Error Loading Products'}
                                    </h3>
                                    <p className="text-sm text-secondary-foreground/80 dark:text-secondary-foreground/80">
                                        {error.message || (isRTL ? 'حدث خطأ أثناء تحميل المنتجات' : 'An error occurred while loading products')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Products Grid */}
                {isLoadingProducts && allProducts.length === 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : allProducts.length === 0 && !error ? (
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center">
                                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {isRTL ? 'لا توجد منتجات' : 'No Products Found'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isRTL ? 'لا توجد منتجات متاحة في هذه الصفحة حالياً' : 'No products are currently available for this page'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {allProducts.map((product, index) => (
                                <ProductCard key={`${product.id}-${index}`} product={product} isRTL={isRTL} />
                            ))}
                        </div>

                        {/* Loading indicator for infinite scroll */}
                        {isFetchingNextPage && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        )}

                        {/* Sentinel element for infinite scroll */}
                        <div ref={ref} className="h-10" />

                        {/* End message */}
                        {!hasNextPage && allProducts.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-muted-foreground">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {isRTL ? 'تم عرض جميع المنتجات المتاحة' : 'You\'ve seen all available products'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ProductsPageViewer;
