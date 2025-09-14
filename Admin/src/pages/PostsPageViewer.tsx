import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Heart,
    Eye,
    MessageCircle,
    Calendar,
    FileText,
    ImageOff,
    AlertCircle,
    Share2,
    ThumbsUp,
    Bookmark,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Users,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import postsPagesService, { PostsPages as PostsPagesType } from '@/services/postsPagesService';
import postService, { PostDto } from '@/services/postService';
import { useIntersection } from '@/hooks/useIntersection';

interface PostCardProps {
    post: PostDto;
    isRTL: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isRTL }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const nextImage = () => {
        if (post.mediaUrls && post.mediaUrls.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % post.mediaUrls!.length);
        }
    };

    const prevImage = () => {
        if (post.mediaUrls && post.mediaUrls.length > 1) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? post.mediaUrls!.length - 1 : prev - 1
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
    };

    // Get localized description or fallback to main description
    const getLocalizedDescription = () => {
        const rtlLocalization = post.localizations?.find(loc => loc.languageCode === 'ar');
        const enLocalization = post.localizations?.find(loc => loc.languageCode === 'en');
        
        if (isRTL && rtlLocalization?.descriptionLocalized) {
            return rtlLocalization.descriptionLocalized;
        }
        if (!isRTL && enLocalization?.descriptionLocalized) {
            return enLocalization.descriptionLocalized;
        }
        
        return post.description;
    };

    return (
        <Card className="w-full max-w-lg mx-auto border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            {/* Post Header (like Facebook post header) */}
            <div className={`p-4 border-b border-gray-100 dark:border-gray-800 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                        {isRTL ? 'منشور' : 'Post'}
                    </h3>
                    <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Users className="h-3 w-3" />
                        <span>{post.postTypeName}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Post Description */}
            {getLocalizedDescription() && (
                <div className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {getLocalizedDescription()}
                    </p>
                </div>
            )}

            {/* Post Media Gallery */}
            <div className="relative bg-gray-50 dark:bg-gray-800 aspect-square">
                {post.mediaUrls && post.mediaUrls.length > 0 && !imageError ? (
                    <>
                        <img
                            src={post.mediaUrls[currentImageIndex]}
                            alt={isRTL ? 'صورة المنشور' : 'Post image'}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                        
                        {/* Image navigation for multiple images */}
                        {post.mediaUrls.length > 1 && (
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
                                    {post.mediaUrls.map((_, index) => (
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

            {/* Post Info */}
            <div className="p-4 space-y-3">
                {/* Post Type and Reactions */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Badge variant="secondary" className="text-xs">
                        {post.postTypeName}
                    </Badge>
                    <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Heart className="h-4 w-4" />
                        <span>{post.numberOfReactions} {isRTL ? 'إعجاب' : 'reactions'}</span>
                    </div>
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
            </div>
        </Card>
    );
};

const PostCardSkeleton: React.FC = () => {
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
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
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
            </div>
        </Card>
    );
};

const PostsPageViewer: React.FC = () => {
    const { isRTL } = useDirection();
    const { id } = useParams<{ id: string }>();
    const postsPagesId = id ? parseInt(id) : 0;

    // Query for posts page info
    const { data: postsPageData, isLoading: isLoadingPage } = useQuery({
        queryKey: ['postsPages', postsPagesId],
        queryFn: () => postsPagesService.getPostsPagesById(postsPagesId),
        enabled: postsPagesId > 0,
    });

    // Infinite query for posts with cursor pagination
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingPosts,
        error
    } = useInfiniteQuery({
        queryKey: ['posts-by-page', postsPagesId],
        queryFn: ({ pageParam }) => 
            postService.getPostsByPageWithCursor({
                postsPagesId,
                cursor: pageParam,
                pageSize: 6, // Load 6 posts at a time
            }),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        enabled: postsPagesId > 0,
    });

    // Intersection observer for infinite scroll
    const { ref, isIntersecting } = useIntersection({
        threshold: 1.0,
    });

    // Trigger loading more posts when sentinel comes into view
    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Flatten posts from all pages
    const allPosts = data?.pages.flatMap(page => page.items) || [];

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
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!postsPageData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'صفحة غير موجودة' : 'Page Not Found'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                        {isRTL ? 'صفحة المنشورات المطلوبة غير متاحة' : 'The requested posts page is not available'}
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
                            {postsPageData.name}
                        </h1>
                        {postsPageData.description && (
                            <p className="text-muted-foreground mt-1">
                                {postsPageData.description}
                            </p>
                        )}
                        <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Badge variant="outline" className="text-xs">
                                {postsPageData.includedPostTypes.length} {isRTL ? 'فئة' : 'post types'}
                            </Badge>
                            <Badge variant={postsPageData.isActive ? 'default' : 'secondary'} className="text-xs">
                                {isRTL ? (postsPageData.isActive ? 'نشط' : 'غير نشط') : (postsPageData.isActive ? 'Active' : 'Inactive')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <div>
                                    <h3 className="font-medium text-red-900 dark:text-red-100">
                                        {isRTL ? 'خطأ في تحميل المنشورات' : 'Error Loading Posts'}
                                    </h3>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {error.message || (isRTL ? 'حدث خطأ أثناء تحميل المنشورات' : 'An error occurred while loading posts')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Posts Grid */}
                {isLoadingPosts && allPosts.length === 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                ) : allPosts.length === 0 && !error ? (
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center">
                                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {isRTL ? 'لا توجد منشورات' : 'No Posts Found'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isRTL ? 'لا توجد منشورات متاحة في هذه الصفحة حالياً' : 'No posts are currently available for this page'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {allPosts.map((post, index) => (
                                <PostCard key={`${post.id}-${index}`} post={post} isRTL={isRTL} />
                            ))}
                        </div>

                        {/* Loading indicator for infinite scroll */}
                        {isFetchingNextPage && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <PostCardSkeleton key={index} />
                                ))}
                            </div>
                        )}

                        {/* Sentinel element for infinite scroll */}
                        <div ref={ref} className="h-10" />

                        {/* End message */}
                        {!hasNextPage && allPosts.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {isRTL ? 'تم عرض جميع المنشورات المتاحة' : 'You\'ve seen all available posts'}
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

export default PostsPageViewer;
