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
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    Store,
    CheckCircle,
    XCircle,
    Power,
    Globe,
    Languages as LanguagesIcon,
    Eye,
    Phone,
    Star,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Provider, PaginatedResult, providerService } from '@/services/providerService';

// Default placeholder image as data URI - Professional provider/business placeholder
const DEFAULT_PROVIDER_IMAGE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRUZGMUYzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzAuMjUgMzguMjVIMzguMjVWMzAuMjVDMzguMjUgMjcuOTA5IDQwLjE1OSAyNiA0Mi41IDI2SDc3LjVDNzkuODQxIDI2IDgxLjc1IDI3LjkwOSA4MS43NSAzMC4yNVYzOC4yNUg4OS43NUM5Mi4wOTEgMzguMjUgOTQgNDAuMTU5IDk0IDQyLjVWNzcuNUM5NCA3OS44NDEgOTIuMDkxIDgxLjc1IDg5Ljc1IDgxLjc1SDMwLjI1QzI3LjkwOSA4MS43NSAyNiA3OS44NDEgMjYgNzcuNVY0Mi41QzI2IDQwLjE1OSAyNy45MDkgMzguMjUgMzAuMjUgMzguMjVaTTQyLjUgMzAuMjVWMzguMjVINzcuNVYzMC4yNUg0Mi41Wk0zMCA0Mi41VjY4LjVINDIuNVY0Mi41SDMwWk00NiA0Mi41Vjc3LjVIOTBWNDIuNUg0NlpNNDYgNzNINTJWNTJINDZWNzNaTTU2IDczSDYyVjUySDU2VjczWk02NiA3M0g3MlY1Mkg2NlY3M1pNNzYgNzNIODJWNTJINzZWNzNaTTg2IDczSDkwVjUySDg2VjczWk0zNCA3M0g0Mi41VjUySDM0Vjczek0zNCA0NkgzNFY0OEgzNFY0NloiIGZpbGw9IiM2ODc3ODciLz4KPC9zdmc+";

// Provider Avatar Component with error handling and placeholder
const ProviderAvatar: React.FC<{ provider: Provider | null; size?: 'sm' | 'md' | 'lg' }> = ({ provider, size = 'sm' }) => {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const imageToShow = (provider?.images?.[0]?.url && !imageError) ? provider.images[0].url : DEFAULT_PROVIDER_IMAGE;

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-border/20`}>
            <img
                src={imageToShow}
                alt={provider?.businessName || 'Provider'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

// Provider Image Preview Component for details dialog
const ProviderImagePreview: React.FC<{ provider: Provider | null }> = ({ provider }) => {
    const [imageError, setImageError] = useState(false);

    const imageToShow = (provider?.images?.[0]?.url && !imageError) ? provider.images[0].url : DEFAULT_PROVIDER_IMAGE;

    return (
        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
            <img
                src={imageToShow}
                alt={provider?.businessName || 'Provider'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

const Providers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [paginatedResult, setPaginatedResult] = useState<PaginatedResult<Provider> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const { isRTL } = useDirection();
    const navigate = useNavigate();

    const handleCreateProvider = () => {
        navigate('/providers/create');
    };

    const handleViewProvider = (providerId: number) => {
        navigate(`/providers/${providerId}`);
    };

    const handleEditProvider = (providerId: number) => {
        navigate(`/providers/${providerId}/edit`);
    };

    const fetchProviders = useCallback(async (page: number = currentPage) => {
        try {
            setLoading(true);
            setError(null);

            const result = await providerService.getAll({
                page,
                pageSize,
            });

            setPaginatedResult(result);
            setCurrentPage(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching providers');
            console.error('Failed to fetch providers:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchProviders(1);
    }, [fetchProviders]);

    // Get current providers
    const providers = paginatedResult?.items || [];

    const filteredProviders = providers.filter(provider =>
        provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= (paginatedResult?.totalPages || 1)) {
            fetchProviders(page);
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isRTL ? 'مقدمو الخدمات' : 'Providers'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRTL
                                ? 'إدارة مقدمي الخدمات ومعلوماتهم التجارية'
                                : 'Manage service providers and their business information'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProviders(currentPage)}
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
                        <Button onClick={handleCreateProvider} className="gap-2">
                            <Plus className="w-4 h-4" />
                            {isRTL ? 'إضافة مقدم خدمة' : 'Add Provider'}
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
                                onClick={() => fetchProviders(currentPage)}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'إجمالي مقدمي الخدمات' : 'Total Providers'}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {loading ? (
                                            <Skeleton className="h-8 w-12" />
                                        ) : (
                                            paginatedResult?.totalCount || 0
                                        )}
                                    </p>
                                </div>
                                <Store className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'نشطون' : 'Active'}
                                    </p>
                                    <p className="text-2xl font-bold text-success">
                                        {loading ? (
                                            <Skeleton className="h-8 w-12" />
                                        ) : (
                                            providers.filter(p => p.isActive).length
                                        )}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'متوسط التقييم' : 'Average Rating'}
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-500">
                                        {loading ? (
                                            <Skeleton className="h-8 w-16" />
                                        ) : (
                                            providers.length > 0
                                                ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
                                                : '0.0'
                                        )}
                                    </p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'مع ترجمات' : 'With Translations'}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {loading ? (
                                            <Skeleton className="h-8 w-12" />
                                        ) : (
                                            providers.filter(p => p.localizations.length > 0).length
                                        )}
                                    </p>
                                </div>
                                <Globe className="h-8 w-8 text-primary" />
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
                                    placeholder={isRTL ? 'البحث في مقدمي الخدمات...' : 'Search providers...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Providers Table */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            {isRTL ? `${filteredProviders.length} مقدم خدمة` : `${filteredProviders.length} Providers`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table dir={isRTL ? 'rtl' : 'ltr'}>
                            <TableHeader>
                                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم الشركة' : 'Business Name'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'التقييم' : 'Rating'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الشركة الأم' : 'Parent Company'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الترجمات' : 'Translations'}</TableHead>
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
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    filteredProviders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Store className="w-12 h-12 text-muted-foreground" />
                                                    <p className="text-muted-foreground">
                                                        {isRTL ? 'لا توجد مقدمي خدمات' : 'No providers found'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProviders.map((provider) => (
                                            <TableRow key={provider.userId} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                    <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                                                        <ProviderAvatar provider={provider} />
                                                        <div>
                                                            <div className="font-medium">{provider.businessName}</div>
                                                            <div className="text-sm text-muted-foreground max-w-xs truncate" title={provider.description}>
                                                                {provider.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {provider.phoneNumber || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getRatingStars(provider.rating)}</TableCell>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                    <Badge variant="outline">
                                                        {provider.parentBusinessName || (isRTL ? 'لا يوجد' : 'None')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(provider.isActive)}</TableCell>
                                                <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                    <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                                                        <Badge variant="outline" className="gap-1">
                                                            <LanguagesIcon className="w-3 h-3" />
                                                            {provider.localizations.length}
                                                        </Badge>
                                                        {provider.localizations.length === 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                                                            </span>
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
                                                                onClick={() => handleViewProvider(provider.userId)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                                onClick={() => handleEditProvider(provider.userId)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                {isRTL ? 'تحرير' : 'Edit'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                                {provider.isActive
                                                                    ? (isRTL ? 'إلغاء تفعيل' : 'Deactivate')
                                                                    : (isRTL ? 'تفعيل' : 'Activate')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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
                            {isRTL ? 'عرض' : 'Showing'} {((currentPage - 1) * pageSize) + 1} {isRTL ? 'إلى' : 'to'} {Math.min(currentPage * pageSize, paginatedResult.totalCount)} {isRTL ? 'من' : 'of'} {paginatedResult.totalCount} {isRTL ? 'مقدم خدمة' : 'providers'}
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

export default Providers;