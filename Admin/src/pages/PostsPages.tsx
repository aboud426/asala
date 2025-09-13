import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    FileText,
    CheckCircle,
    XCircle,
    Power,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Globe,
    Eye,
    Key,
    Tags,
    Layout,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postsPagesService, {
    PostsPages as PostsPagesType,
    CreatePostsPagesDto,
    UpdatePostsPagesDto,
    CreatePostsPagesLocalizedDto,
    UpdatePostsPagesLocalizedDto,
    PaginatedResult
} from '@/services/postsPagesService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import postTypeService, { PostTypeDropdownDto } from '@/services/postTypeService';
import { Link } from 'react-router-dom';

const PostsPages: React.FC = () => {
    const { isRTL } = useDirection();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedPostsPages, setSelectedPostsPages] = useState<PostsPagesType | null>(null);
    const [selectedPostsPagesForDetails, setSelectedPostsPagesForDetails] = useState<PostsPagesType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    // Form setup
    const createForm = useForm<CreatePostsPagesDto>({
        defaultValues: {
            key: '',
            name: '',
            description: '',
            localizations: [],
            includedPostTypeIds: [],
        },
    });

    const editForm = useForm<UpdatePostsPagesDto>({
        defaultValues: {
            key: '',
            name: '',
            description: '',
            isActive: true,
            localizations: [],
            includedPostTypeIds: [],
        },
    });

    const {
        fields: createLocalizations,
        append: appendCreateLocalization,
        remove: removeCreateLocalization,
    } = useFieldArray({
        control: createForm.control,
        name: 'localizations',
    });

    const {
        fields: editLocalizations,
        append: appendEditLocalization,
        remove: removeEditLocalization,
    } = useFieldArray({
        control: editForm.control,
        name: 'localizations',
    });

    // Query for posts pages data
    const { data: postsPagesData, isLoading, error } = useQuery({
        queryKey: ['postsPages', currentPage, pageSize, statusFilter],
        queryFn: () => {
            const params: {
                page: number;
                pageSize: number;
                activeOnly?: boolean;
            } = {
                page: currentPage,
                pageSize,
            };

            // Only add activeOnly filter if not showing 'all'
            if (statusFilter === 'active') {
                params.activeOnly = true;
            } else if (statusFilter === 'inactive') {
                params.activeOnly = false;
            }

            return postsPagesService.getPostsPages(params);
        },
    });

    // Query for all posts pages to calculate stats
    const { data: allPostsPagesData } = useQuery({
        queryKey: ['postsPages-all'],
        queryFn: () => postsPagesService.getPostsPages({ pageSize: 1000 }),
    });

    // Query for languages dropdown
    const { data: languagesData } = useQuery({
        queryKey: ['languages-dropdown'],
        queryFn: () => languageService.getLanguagesDropdown(),
    });

    // Query for post types dropdown
    const { data: postTypesData } = useQuery({
        queryKey: ['postTypes-dropdown'],
        queryFn: () => postTypeService.getPostTypesDropdown(),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: postsPagesService.createPostsPages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postsPages'] });
            queryClient.invalidateQueries({ queryKey: ['postsPages-all'] });
            toast.success(isRTL ? 'تم إنشاء صفحة المقالات بنجاح' : 'Posts page created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء صفحة المقالات' : 'Error creating posts page'));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePostsPagesDto }) =>
            postsPagesService.updatePostsPages(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postsPages'] });
            queryClient.invalidateQueries({ queryKey: ['postsPages-all'] });
            toast.success(isRTL ? 'تم تحديث صفحة المقالات بنجاح' : 'Posts page updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث صفحة المقالات' : 'Error updating posts page'));
        },
    });

    const toggleMutation = useMutation({
        mutationFn: postsPagesService.togglePostsPagesActivation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postsPages'] });
            queryClient.invalidateQueries({ queryKey: ['postsPages-all'] });
            toast.success(isRTL ? 'تم تحديث حالة صفحة المقالات' : 'Posts page status updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة صفحة المقالات' : 'Error updating posts page status'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: postsPagesService.deletePostsPages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['postsPages'] });
            queryClient.invalidateQueries({ queryKey: ['postsPages-all'] });
            toast.success(isRTL ? 'تم حذف صفحة المقالات بنجاح' : 'Posts page deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف صفحة المقالات' : 'Error deleting posts page'));
        },
    });

    // Filter posts pages client-side for search
    const filteredPostsPages = postsPagesData?.items.filter(postsPages => {
        const matchesSearch = postsPages.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            postsPages.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            postsPages.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            postsPages.localizations.some(loc =>
                loc.nameLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loc.descriptionLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (loc.languageName && loc.languageName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        return matchesSearch;
    }) || [];

    // Stats
    const stats = {
        total: allPostsPagesData?.totalCount || 0,
        active: allPostsPagesData?.items.filter(pp => pp.isActive).length || 0,
        inactive: allPostsPagesData?.items.filter(pp => !pp.isActive).length || 0,
    };

    // Form handlers
    const onCreateSubmit = async (data: CreatePostsPagesDto) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const onEditSubmit = async (data: UpdatePostsPagesDto) => {
        if (!selectedPostsPages) return;
        updateMutation.mutate({ id: selectedPostsPages.id, data }, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedPostsPages(null);
                editForm.reset();
            },
        });
    };

    const handleEdit = (postsPages: PostsPagesType) => {
        setSelectedPostsPages(postsPages);
        editForm.reset({
            key: postsPages.key,
            name: postsPages.name,
            description: postsPages.description,
            isActive: postsPages.isActive,
            localizations: postsPages.localizations.map(loc => ({
                id: loc.id,
                nameLocalized: loc.nameLocalized,
                descriptionLocalized: loc.descriptionLocalized,
                languageId: loc.languageId,
                isActive: loc.isActive,
            })),
            includedPostTypeIds: postsPages.includedPostTypes.map(ipt => ipt.postTypeId),
        });
        setIsEditDialogOpen(true);
    };

    const handleShowDetails = (postsPages: PostsPagesType) => {
        setSelectedPostsPagesForDetails(postsPages);
        setIsDetailsDialogOpen(true);
    };

    const addNewLocalization = (isEdit: boolean = false) => {
        const newLocalization = {
            nameLocalized: '',
            descriptionLocalized: '',
            languageId: 0,
            isActive: true,
        };

        if (isEdit) {
            appendEditLocalization(newLocalization);
        } else {
            appendCreateLocalization(newLocalization);
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isActive
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                <span className="font-semibold">
                    {isRTL ? (isActive ? 'نشط' : 'غير نشط') : (isActive ? 'Active' : 'Inactive')}
                </span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isRTL ? 'إدارة صفحات المنشورات' : 'Posts Pages Management'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRTL ? 'إدارة صفحات المنشورات وترجماتها وأنواع المنشورات المضمنة' : 'Manage posts pages, their translations and included post types'}
                        </p>
                    </div>
                    <Button
                        className="gradient-primary flex items-center gap-2"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        {isRTL ? 'إضافة صفحة منشورات جديدة' : 'Add New Posts Page'}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {isRTL ? 'إجمالي الصفحات' : 'Total Pages'}
                                    </p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
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
                                        {isRTL ? 'الصفحات النشطة' : 'Active Pages'}
                                    </p>
                                    <p className="text-2xl font-bold text-success">{stats.active}</p>
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
                                        {isRTL ? 'الصفحات غير النشطة' : 'Inactive Pages'}
                                    </p>
                                    <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-muted-foreground" />
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
                                    placeholder={isRTL ? 'البحث في صفحات المقالات...' : 'Search posts pages...'}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                                />
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${statusFilter === 'active' ? 'bg-emerald-500' :
                                                    statusFilter === 'inactive' ? 'bg-red-500' :
                                                        'bg-gradient-to-r from-emerald-500 to-red-500'
                                                }`} />
                                            {isRTL ?
                                                (statusFilter === 'all' ? 'جميع الحالات' : statusFilter === 'active' ? 'نشط' : 'غير نشط') :
                                                (statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive')
                                            }
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            onClick={() => setStatusFilter('all')}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-red-500" />
                                            {isRTL ? 'جميع الحالات' : 'All Status'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setStatusFilter('active')}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            {isRTL ? 'نشط' : 'Active'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setStatusFilter('inactive')}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            {isRTL ? 'غير نشط' : 'Inactive'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Pages Table */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {isRTL ? `${filteredPostsPages.length} صفحة منشورات` : `${filteredPostsPages.length} Posts Pages`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table dir={isRTL ? 'rtl' : 'ltr'}>
                            <TableHeader>
                                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'مفتاح الصفحة' : 'Page Key'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم الصفحة' : 'Page Name'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الترجمات' : 'Localizations'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'أنواع المنشورات' : 'Post Types'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                                    <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                <span className={isRTL ? 'mr-2' : 'ml-2'}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                        <TableCell colSpan={8} className="text-center py-8 text-destructive">
                                            {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPostsPages.length === 0 ? (
                                    <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            {isRTL ? 'لا توجد صفحات منشورات متاحة' : 'No posts pages available'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPostsPages.map((postsPages) => (
                                        <TableRow key={postsPages.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
                                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                                        <Key className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm font-mono">{postsPages.key}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <p className="font-medium text-sm">{postsPages.name}</p>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className="max-w-xs">
                                                    <p className="text-sm truncate" title={postsPages.description}>
                                                        {postsPages.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                                                    {postsPages.localizations.map((loc) => (
                                                        <Badge key={loc.id} variant="outline" className="text-xs">
                                                            <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {loc.languageCode}
                                                        </Badge>
                                                    ))}
                                                    {postsPages.localizations.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                                                    {postsPages.includedPostTypes.slice(0, 2).map((ipt) => (
                                                        <Badge key={ipt.id} variant="secondary" className="text-xs">
                                                            <Tags className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {ipt.postType.name}
                                                        </Badge>
                                                    ))}
                                                    {postsPages.includedPostTypes.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{postsPages.includedPostTypes.length - 2}
                                                        </Badge>
                                                    )}
                                                    {postsPages.includedPostTypes.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isRTL ? 'لا توجد أنواع' : 'No types'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(postsPages.isActive)}</TableCell>
                                            <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {formatDate(postsPages.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to={`/posts-pages/${postsPages.id}/view`}
                                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            >
                                                                <Layout className="h-4 w-4" />
                                                                {isRTL ? 'عرض المنشورات' : 'View Posts'}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => handleShowDetails(postsPages)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => handleEdit(postsPages)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            {isRTL ? 'تحرير' : 'Edit'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => toggleMutation.mutate(postsPages.id)}
                                                        >
                                                            <Power className="h-4 w-4" />
                                                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => deleteMutation.mutate(postsPages.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {isRTL ? 'حذف' : 'Delete'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {postsPagesData && postsPagesData.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    {isRTL
                                        ? `عرض ${((postsPagesData.page - 1) * postsPagesData.pageSize) + 1} إلى ${Math.min(postsPagesData.page * postsPagesData.pageSize, postsPagesData.totalCount)} من ${postsPagesData.totalCount}`
                                        : `Showing ${((postsPagesData.page - 1) * postsPagesData.pageSize) + 1} to ${Math.min(postsPagesData.page * postsPagesData.pageSize, postsPagesData.totalCount)} of ${postsPagesData.totalCount}`
                                    }
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={!postsPagesData.hasPreviousPage}
                                    >
                                        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {isRTL ? `${postsPagesData.page} من ${postsPagesData.totalPages}` : `${postsPagesData.page} of ${postsPagesData.totalPages}`}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={!postsPagesData.hasNextPage}
                                    >
                                        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Posts Pages Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isRTL ? 'إضافة صفحة منشورات جديدة' : 'Add New Posts Page'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'أدخل معلومات صفحة المقالات الجديدة وترجماتها وأنواع المنشورات المضمنة' : 'Enter the details for the new posts page, its translations and included post types'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={createForm.control}
                                        name="key"
                                        rules={{ required: isRTL ? 'مفتاح الصفحة مطلوب' : 'Page key is required' }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{isRTL ? 'مفتاح الصفحة' : 'Page Key'}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={isRTL ? 'مثال: posts-home, featured-posts' : 'e.g., posts-home, featured-posts'}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="name"
                                        rules={{ required: isRTL ? 'اسم الصفحة مطلوب' : 'Page name is required' }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{isRTL ? 'اسم الصفحة' : 'Page Name'}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={isRTL ? 'مثال: الصفحة الرئيسية للمقالات' : 'e.g., Posts Home Page'}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={createForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={isRTL ? 'وصف صفحة المقالات' : 'Posts page description'}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="includedPostTypeIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Tags className="h-4 w-4 text-primary" />
                                                {isRTL ? 'أنواع المنشورات المضمنة' : 'Included Post Types'}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    value={field.value?.map(String) || []}
                                                    onValueChange={(values) => field.onChange(values.map(Number))}
                                                    placeholder={isRTL ? 'اختر أنواع المنشورات المضمنة' : 'Select post types'}
                                                    searchPlaceholder={isRTL ? 'البحث في الأنواع...' : 'Search types...'}
                                                    emptyText={isRTL ? 'لا توجد أنواع متاحة' : 'No types found'}
                                                    maxDisplay={2}
                                                    options={postTypesData?.map(postType => ({
                                                        value: postType.id.toString(),
                                                        label: postType.name
                                                    })) || []}
                                                    className={isRTL ? 'text-right' : 'text-left'}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {isRTL ? 'يمكنك اختيار عدة أنواع مقالات لتضمينها في هذه الصفحة' : 'You can select multiple post types to include in this page'}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Localizations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{isRTL ? 'الترجمات' : 'Localizations'}</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addNewLocalization(false)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                                        </Button>
                                    </div>

                                    {createLocalizations.map((field, index) => (
                                        <Card key={field.id} className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-medium">
                                                    {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                                                </h5>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeCreateLocalization(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={createForm.control}
                                                    name={`localizations.${index}.languageId`}
                                                    rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select Language'} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {languagesData?.map((lang) => (
                                                                        <SelectItem key={lang.id} value={lang.id.toString()}>
                                                                            <div className="flex items-center gap-2">
                                                                                <Globe className="h-4 w-4" />
                                                                                {lang.name} ({lang.code})
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createForm.control}
                                                    name={`localizations.${index}.nameLocalized`}
                                                    rules={{ required: isRTL ? 'الاسم مطلوب' : 'Name is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'الاسم المترجم' : 'Translated Name'}</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={isRTL ? 'الاسم المترجم' : 'Translated name'}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <FormField
                                                    control={createForm.control}
                                                    name={`localizations.${index}.descriptionLocalized`}
                                                    rules={{ required: isRTL ? 'الوصف مطلوب' : 'Description is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'الوصف المترجم' : 'Translated Description'}</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder={isRTL ? 'الوصف المترجم' : 'Translated description'}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                    <Button type="submit" className="gradient-primary">
                                        {isRTL ? 'إنشاء' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Edit Posts Pages Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isRTL ? 'تحرير صفحة المنشورات' : 'Edit Posts Page'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'قم بتحديث معلومات صفحة المقالات وترجماتها وأنواع المنشورات المضمنة' : 'Update the posts page details, translations and included post types'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...editForm}>
                            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={editForm.control}
                                        name="key"
                                        rules={{ required: isRTL ? 'مفتاح الصفحة مطلوب' : 'Page key is required' }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{isRTL ? 'مفتاح الصفحة' : 'Page Key'}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        rules={{ required: isRTL ? 'اسم الصفحة مطلوب' : 'Page name is required' }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{isRTL ? 'اسم الصفحة' : 'Page Name'}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={editForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editForm.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    {isRTL ? 'الصفحة نشطة' : 'Active Page'}
                                                </FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    {isRTL ? 'تفعيل أو إلغاء تفعيل صفحة المقالات' : 'Enable or disable this posts page'}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editForm.control}
                                    name="includedPostTypeIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Tags className="h-4 w-4 text-primary" />
                                                {isRTL ? 'أنواع المنشورات المضمنة' : 'Included Post Types'}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    value={field.value?.map(String) || []}
                                                    onValueChange={(values) => field.onChange(values.map(Number))}
                                                    placeholder={isRTL ? 'اختر أنواع المنشورات المضمنة' : 'Select post types'}
                                                    searchPlaceholder={isRTL ? 'البحث في الأنواع...' : 'Search types...'}
                                                    emptyText={isRTL ? 'لا توجد أنواع متاحة' : 'No types found'}
                                                    maxDisplay={2}
                                                    options={postTypesData?.map(postType => ({
                                                        value: postType.id.toString(),
                                                        label: postType.name
                                                    })) || []}
                                                    className={isRTL ? 'text-right' : 'text-left'}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {isRTL ? 'يمكنك تحديث أنواع المنشورات المضمنة في هذه الصفحة' : 'You can update the post types included in this page'}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Edit Localizations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{isRTL ? 'الترجمات' : 'Localizations'}</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addNewLocalization(true)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                                        </Button>
                                    </div>

                                    {editLocalizations.map((field, index) => (
                                        <Card key={field.id} className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-medium">
                                                    {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                                                </h5>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeEditLocalization(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={editForm.control}
                                                    name={`localizations.${index}.languageId`}
                                                    rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select Language'} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {languagesData?.map((lang) => (
                                                                        <SelectItem key={lang.id} value={lang.id.toString()}>
                                                                            <div className="flex items-center gap-2">
                                                                                <Globe className="h-4 w-4" />
                                                                                {lang.name} ({lang.code})
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={editForm.control}
                                                    name={`localizations.${index}.nameLocalized`}
                                                    rules={{ required: isRTL ? 'الاسم مطلوب' : 'Name is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'الاسم المترجم' : 'Translated Name'}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <FormField
                                                    control={editForm.control}
                                                    name={`localizations.${index}.descriptionLocalized`}
                                                    rules={{ required: isRTL ? 'الوصف مطلوب' : 'Description is required' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{isRTL ? 'الوصف المترجم' : 'Translated Description'}</FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <FormField
                                                    control={editForm.control}
                                                    name={`localizations.${index}.isActive`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-sm">
                                                                    {isRTL ? 'الترجمة نشطة' : 'Active Translation'}
                                                                </FormLabel>
                                                            </div>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditDialogOpen(false)}
                                    >
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                    <Button type="submit" className="gradient-primary">
                                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Posts Pages Details Dialog */}
                <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary-foreground" />
                                </div>
                                {isRTL ? 'تفاصيل صفحة المنشورات' : 'Posts Page Details'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'عرض شامل لمعلومات صفحة المقالات وترجماتها وأنواع المنشورات المضمنة' : 'Comprehensive view of posts page information, translations and included post types'}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedPostsPagesForDetails && (
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'مفتاح الصفحة' : 'Page Key'}
                                                </label>
                                                <div className="p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm font-mono font-medium">{selectedPostsPagesForDetails.key}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'اسم الصفحة' : 'Page Name'}
                                                </label>
                                                <div className="p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm font-medium">{selectedPostsPagesForDetails.name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'الحالة' : 'Status'}
                                                </label>
                                                <div className="p-3">
                                                    {getStatusBadge(selectedPostsPagesForDetails.isActive)}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                                                </label>
                                                <div className="p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm">{formatDate(selectedPostsPagesForDetails.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                {isRTL ? 'الوصف' : 'Description'}
                                            </label>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm leading-relaxed">
                                                    {selectedPostsPagesForDetails.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Included Post Types */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Tags className="h-5 w-5 text-primary" />
                                            {isRTL ? 'أنواع المنشورات المضمنة' : 'Included Post Types'}
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedPostsPagesForDetails.includedPostTypes.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedPostsPagesForDetails.includedPostTypes.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">
                                                    {isRTL ? 'لا توجد أنواع مقالات مضمنة في هذه الصفحة' : 'No post types included in this page'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {selectedPostsPagesForDetails.includedPostTypes.map((includedType) => (
                                                    <Card key={includedType.id} className="border border-border/50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <Tags className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium text-sm">
                                                                            {includedType.postType.name}
                                                                        </h4>
                                                                    </div>
                                                                </div>
                                                                {getStatusBadge(includedType.isActive)}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="p-3 bg-muted/30 rounded-lg">
                                                                    <p className="text-sm">
                                                                        {includedType.postType.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                                                                <span>{isRTL ? 'تاريخ الإضافة:' : 'Added:'} {formatDate(includedType.createdAt)}</span>
                                                                <span>ID: {includedType.postType.id}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Localizations */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-primary" />
                                            {isRTL ? 'الترجمات' : 'Localizations'}
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedPostsPagesForDetails.localizations.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedPostsPagesForDetails.localizations.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">
                                                    {isRTL ? 'لا توجد ترجمات متاحة لصفحة المنشورات هذه' : 'No translations available for this posts page'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedPostsPagesForDetails.localizations.map((localization, index) => (
                                                    <Card key={localization.id} className="border border-border/50">
                                                        <CardContent className="p-4">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <Globe className="h-4 w-4 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-medium text-sm">
                                                                                {localization.languageName} ({localization.languageCode})
                                                                            </h4>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {getStatusBadge(localization.isActive)}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-muted-foreground">
                                                                        {isRTL ? 'الاسم المترجم' : 'Translated Name'}
                                                                    </label>
                                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                                        <p className="text-sm font-medium">
                                                                            {localization.nameLocalized}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-muted-foreground">
                                                                        {isRTL ? 'الوصف المترجم' : 'Translated Description'}
                                                                    </label>
                                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                                        <p className="text-sm leading-relaxed">
                                                                            {localization.descriptionLocalized}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs font-medium text-muted-foreground">
                                                                            {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                                                                        </label>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(localization.createdAt)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs font-medium text-muted-foreground">
                                                                            {isRTL ? 'تاريخ التحديث' : 'Updated'}
                                                                        </label>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(localization.updatedAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Statistics */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                            {isRTL ? 'إحصائيات صفحة المنشورات' : 'Posts Page Statistics'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    {selectedPostsPagesForDetails.localizations.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-emerald-600 mb-1">
                                                    {selectedPostsPagesForDetails.localizations.filter(l => l.isActive).length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                                    {selectedPostsPagesForDetails.includedPostTypes.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'أنواع المنشورات' : 'Post Types'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600 mb-1">
                                                    {selectedPostsPagesForDetails.key.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'طول المفتاح' : 'Key Length'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDetailsDialogOpen(false);
                                    setSelectedPostsPagesForDetails(null);
                                }}
                            >
                                {isRTL ? 'إغلاق' : 'Close'}
                            </Button>
                            <Button
                                type="button"
                                className="gradient-primary"
                                onClick={() => {
                                    if (selectedPostsPagesForDetails) {
                                        handleEdit(selectedPostsPagesForDetails);
                                        setIsDetailsDialogOpen(false);
                                        setSelectedPostsPagesForDetails(null);
                                    }
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                {isRTL ? 'تحرير صفحة المنشورات' : 'Edit Posts Page'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default PostsPages;
