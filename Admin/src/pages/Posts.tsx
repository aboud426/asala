import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Heart,
  User,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { PostDto, PaginatedResult, postService } from '@/services/postService';
import { PostTypeDropdownDto, postTypeService } from '@/services/postTypeService';

const Posts: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<PostDto> | null>(null);
  const [postTypes, setPostTypes] = useState<PostTypeDropdownDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handleCreatePost = () => {
    navigate('/posts/create');
  };

  const handleViewPost = (postId: number) => {
    navigate(`/posts/${postId}`);
  };

  const handleEditPost = (postId: number) => {
    navigate(`/posts/${postId}/edit`);
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        fetchPosts(currentPage); // Refresh the current page
      } catch (err) {
        console.error('Failed to delete post:', err);
        alert(isRTL ? 'فشل في حذف المنشور' : 'Failed to delete post');
      }
    }
  };

  const handleTogglePostActivation = async (postId: number) => {
    try {
      await postService.togglePostActivation(postId);
      fetchPosts(currentPage); // Refresh the current page
    } catch (err) {
      console.error('Failed to toggle post activation:', err);
      alert(isRTL ? 'فشل في تغيير حالة المنشور' : 'Failed to toggle post activation');
    }
  };

  const fetchPostTypes = useCallback(async () => {
    try {
      const postTypesData = await postTypeService.getPostTypesDropdown();
      setPostTypes(postTypesData);
    } catch (err) {
      console.error('Failed to fetch post types:', err);
      // Don't show error for post types as it's not critical
    }
  }, []);

  const fetchPosts = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const result = await postService.getPostsLocalized({
        page,
        pageSize,
        languageCode: isRTL ? 'ar' : 'en',
        activeOnly: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      });

      setPaginatedResult(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching posts');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, isRTL, statusFilter]);

  useEffect(() => {
    fetchPosts(1);
    fetchPostTypes();
  }, [fetchPosts, fetchPostTypes]);

  // Get current posts
  const posts = paginatedResult?.items || [];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.localizations && post.localizations.some(loc => 
        loc.descriptionLocalized.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesPostType = postTypeFilter === 'all' || post.postTypeId.toString() === postTypeFilter;
    
    return matchesSearch && matchesPostType;
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (paginatedResult?.totalPages || 1)) {
      fetchPosts(page);
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
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getLocalizedDescription = (post: PostDto) => {
    if (isRTL && post.localizations && post.localizations.length > 0) {
      const arabicLocalization = post.localizations.find(loc => loc.languageCode === 'ar');
      if (arabicLocalization) {
        return arabicLocalization.descriptionLocalized;
      }
    }
    return post.description;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إدارة المنشورات' : 'Posts Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة المنشورات والمحتوى' : 'Manage your posts and content'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(currentPage)}
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
            <Button onClick={handleCreatePost} className="gap-2">
              <Plus className="w-4 h-4" />
              {isRTL ? 'إضافة منشور جديد' : 'Add New Post'}
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
                onClick={() => fetchPosts(currentPage)}
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
                    {isRTL ? 'إجمالي المنشورات' : 'Total Posts'}
                  </p>
                  <p className="text-2xl font-bold">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      paginatedResult?.totalCount || 0
                    )}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'منشورات نشطة' : 'Active Posts'}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      posts.filter(p => p.isActive).length
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
                      posts.reduce((total, post) => total + post.numberOfReactions, 0)
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
                    {isRTL ? 'أنواع المنشورات' : 'Post Types'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      new Set(posts.map(p => p.postTypeId)).size
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
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث في المنشورات...' : 'Search posts...'}
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
                      <Filter className="h-4 w-4" />
                      {isRTL ? 'نوع المنشور' : 'Post Type'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setPostTypeFilter('all')}>
                      {isRTL ? 'جميع الأنواع' : 'All Types'}
                    </DropdownMenuItem>
                    {postTypes.map((postType) => (
                      <DropdownMenuItem 
                        key={postType.id}
                        onClick={() => setPostTypeFilter(postType.id.toString())}
                      >
                        {postType.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredPosts.length} منشور` : `${filteredPosts.length} Posts`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المنشور' : 'Post'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المؤلف' : 'Author'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'التفاعلات' : 'Reactions'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {isRTL ? 'لا توجد منشورات' : 'No posts found'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="space-y-1 max-w-xs">
                            <p className="text-sm text-muted-foreground">#{post.id}</p>
                            <p className="font-medium text-sm leading-relaxed">
                              {truncateText(getLocalizedDescription(post), 80)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">User #{post.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <Badge variant="outline">
                            {post.postTypeName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span className="font-medium">{post.numberOfReactions}</span>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          {getStatusBadge(post.isActive)}
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
                                onClick={() => handleViewPost(post.id)}
                              >
                                <Eye className="h-4 w-4" />
                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleEditPost(post.id)}
                              >
                                <Edit className="h-4 w-4" />
                                {isRTL ? 'تحرير' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleTogglePostActivation(post.id)}
                              >
                                {post.isActive ? (
                                  <TrendingDown className="h-4 w-4" />
                                ) : (
                                  <TrendingUp className="h-4 w-4" />
                                )}
                                {post.isActive 
                                  ? (isRTL ? 'إلغاء التفعيل' : 'Deactivate')
                                  : (isRTL ? 'تفعيل' : 'Activate')
                                }
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleDeletePost(post.id)}
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

        {/* Pagination */}
        {paginatedResult && !loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRTL ? 'عرض' : 'Showing'} {((currentPage - 1) * pageSize) + 1} {isRTL ? 'إلى' : 'to'} {Math.min(currentPage * pageSize, paginatedResult.totalCount)} {isRTL ? 'من' : 'of'} {paginatedResult.totalCount} {isRTL ? 'منشور' : 'posts'}
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

export default Posts;
