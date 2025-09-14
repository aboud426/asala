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
    Package,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsPagesService, {
    ProductsPages as ProductsPagesType,
    CreateProductsPagesDto,
    UpdateProductsPagesDto,
    CreateProductsPagesLocalizedDto,
    UpdateProductsPagesLocalizedDto,
    PaginatedResult
} from '@/services/productsPagesService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import productCategoryService, { ProductCategoryDropdownDto } from '@/services/productCategoryService';
import { Link } from 'react-router-dom';

const ProductsPages: React.FC = () => {
    const { isRTL } = useDirection();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedProductsPages, setSelectedProductsPages] = useState<ProductsPagesType | null>(null);
    const [selectedProductsPagesForDetails, setSelectedProductsPagesForDetails] = useState<ProductsPagesType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    // Form setup
    const createForm = useForm<CreateProductsPagesDto>({
        defaultValues: {
            key: '',
            name: '',
            description: '',
            localizations: [],
            includedProductCategoryIds: [],
        },
    });

    const editForm = useForm<UpdateProductsPagesDto>({
        defaultValues: {
            key: '',
            name: '',
            description: '',
            isActive: true,
            localizations: [],
            includedProductCategoryIds: [],
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

    // Query for products pages data
    const { data: productsPagesData, isLoading, error } = useQuery({
        queryKey: ['productsPages', currentPage, pageSize, statusFilter],
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

            return productsPagesService.getProductsPages(params);
        },
    });

    // Query for all products pages to calculate stats
    const { data: allProductsPagesData } = useQuery({
        queryKey: ['productsPages-all'],
        queryFn: () => productsPagesService.getProductsPages({ pageSize: 1000 }),
    });

    // Query for languages dropdown
    const { data: languagesData } = useQuery({
        queryKey: ['languages-dropdown'],
        queryFn: () => languageService.getLanguagesDropdown(),
    });

    // Query for product categories dropdown
    const { data: productCategoriesData } = useQuery({
        queryKey: ['productCategories-dropdown'],
        queryFn: () => productCategoryService.getProductCategoriesDropdown(),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: productsPagesService.createProductsPages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPages'] });
            queryClient.invalidateQueries({ queryKey: ['productsPages-all'] });
            toast.success(isRTL ? 'تم إنشاء صفحة المنتجات بنجاح' : 'Products page created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء صفحة المنتجات' : 'Error creating products page'));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductsPagesDto }) =>
            productsPagesService.updateProductsPages(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPages'] });
            queryClient.invalidateQueries({ queryKey: ['productsPages-all'] });
            toast.success(isRTL ? 'تم تحديث صفحة المنتجات بنجاح' : 'Products page updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث صفحة المنتجات' : 'Error updating products page'));
        },
    });

    const toggleMutation = useMutation({
        mutationFn: productsPagesService.toggleProductsPagesActivation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPages'] });
            queryClient.invalidateQueries({ queryKey: ['productsPages-all'] });
            toast.success(isRTL ? 'تم تحديث حالة صفحة المنتجات' : 'Products page status updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة صفحة المنتجات' : 'Error updating products page status'));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: productsPagesService.deleteProductsPages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPages'] });
            queryClient.invalidateQueries({ queryKey: ['productsPages-all'] });
            toast.success(isRTL ? 'تم حذف صفحة المنتجات بنجاح' : 'Products page deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف صفحة المنتجات' : 'Error deleting products page'));
        },
    });

    // Filter products pages client-side for search
    const filteredProductsPages = productsPagesData?.items.filter(productsPages => {
        const matchesSearch = productsPages.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productsPages.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productsPages.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            productsPages.localizations.some(loc =>
                loc.nameLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loc.descriptionLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (loc.languageName && loc.languageName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        return matchesSearch;
    }) || [];

    // Stats
    const stats = {
        total: allProductsPagesData?.totalCount || 0,
        active: allProductsPagesData?.items.filter(pp => pp.isActive).length || 0,
        inactive: allProductsPagesData?.items.filter(pp => !pp.isActive).length || 0,
    };

    // Form handlers
    const onCreateSubmit = async (data: CreateProductsPagesDto) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const onEditSubmit = async (data: UpdateProductsPagesDto) => {
        if (!selectedProductsPages) return;
        updateMutation.mutate({ id: selectedProductsPages.id, data }, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedProductsPages(null);
                editForm.reset();
            },
        });
    };

    const handleEdit = (productsPages: ProductsPagesType) => {
        setSelectedProductsPages(productsPages);
        editForm.reset({
            key: productsPages.key,
            name: productsPages.name,
            description: productsPages.description,
            isActive: productsPages.isActive,
            localizations: productsPages.localizations.map(loc => ({
                id: loc.id,
                nameLocalized: loc.nameLocalized,
                descriptionLocalized: loc.descriptionLocalized,
                languageId: loc.languageId,
                isActive: loc.isActive,
            })),
            includedProductCategoryIds: productsPages.includedProductTypes.map(ipt => ipt.productCategoryId),
        });
        setIsEditDialogOpen(true);
    };

    const handleShowDetails = (productsPages: ProductsPagesType) => {
        setSelectedProductsPagesForDetails(productsPages);
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
                ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/40'
                : 'bg-secondary/10 text-secondary-foreground border border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/40'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isActive
                    ? 'bg-primary shadow-sm shadow-primary/50'
                    : 'bg-secondary shadow-sm shadow-secondary/50'}`} />
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
                            {isRTL ? 'إدارة صفحات المنتجات' : 'Products Pages Management'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRTL ? 'إدارة صفحات المنتجات وترجماتها وفئات المنتجات المضمنة' : 'Manage products pages, their translations and included product categories'}
                        </p>
                    </div>
                    <Button
                        className="gradient-primary flex items-center gap-2"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        {isRTL ? 'إضافة صفحة منتجات جديدة' : 'Add New Products Page'}
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
                                    placeholder={isRTL ? 'البحث في صفحات المنتجات...' : 'Search products pages...'}
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
                                            <div className={`w-2 h-2 rounded-full ${statusFilter === 'active' ? 'bg-primary' :
                                                    statusFilter === 'inactive' ? 'bg-secondary' :
                                                        'bg-gradient-to-r from-primary to-secondary'
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
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                                            {isRTL ? 'جميع الحالات' : 'All Status'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setStatusFilter('active')}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            {isRTL ? 'نشط' : 'Active'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setStatusFilter('inactive')}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-secondary" />
                                            {isRTL ? 'غير نشط' : 'Inactive'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Pages Table */}
                <Card className="border-0 shadow-elegant">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {isRTL ? `${filteredProductsPages.length} صفحة منتجات` : `${filteredProductsPages.length} Products Pages`}
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
                                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'فئات المنتجات' : 'Product Categories'}</TableHead>
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
                                ) : filteredProductsPages.length === 0 ? (
                                    <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            {isRTL ? 'لا توجد صفحات منتجات متاحة' : 'No products pages available'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProductsPages.map((productsPages) => (
                                        <TableRow key={productsPages.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
                                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                                                        <Key className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm font-mono">{productsPages.key}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <p className="font-medium text-sm">{productsPages.name}</p>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className="max-w-xs">
                                                    <p className="text-sm truncate" title={productsPages.description}>
                                                        {productsPages.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                                                    {productsPages.localizations.map((loc) => (
                                                        <Badge key={loc.id} variant="outline" className="text-xs">
                                                            <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {loc.languageCode}
                                                        </Badge>
                                                    ))}
                                                    {productsPages.localizations.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                                                    {productsPages.includedProductTypes.slice(0, 2).map((ipt) => (
                                                        <Badge key={ipt.id} variant="secondary" className="text-xs">
                                                            <Tags className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                                            {ipt.productCategory.name}
                                                        </Badge>
                                                    ))}
                                                    {productsPages.includedProductTypes.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{productsPages.includedProductTypes.length - 2}
                                                        </Badge>
                                                    )}
                                                    {productsPages.includedProductTypes.length === 0 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {isRTL ? 'لا توجد فئات' : 'No categories'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(productsPages.isActive)}</TableCell>
                                            <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {formatDate(productsPages.createdAt)}
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
                                                                to={`/products-pages/${productsPages.id}/view`}
                                                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            >
                                                                <Package className="h-4 w-4" />
                                                                {isRTL ? 'عرض المنتجات' : 'View Products'}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => handleShowDetails(productsPages)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => handleEdit(productsPages)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            {isRTL ? 'تحرير' : 'Edit'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => toggleMutation.mutate(productsPages.id)}
                                                        >
                                                            <Power className="h-4 w-4" />
                                                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                                            onClick={() => deleteMutation.mutate(productsPages.id)}
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
                        {productsPagesData && productsPagesData.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    {isRTL
                                        ? `عرض ${((productsPagesData.page - 1) * productsPagesData.pageSize) + 1} إلى ${Math.min(productsPagesData.page * productsPagesData.pageSize, productsPagesData.totalCount)} من ${productsPagesData.totalCount}`
                                        : `Showing ${((productsPagesData.page - 1) * productsPagesData.pageSize) + 1} to ${Math.min(productsPagesData.page * productsPagesData.pageSize, productsPagesData.totalCount)} of ${productsPagesData.totalCount}`
                                    }
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={!productsPagesData.hasPreviousPage}
                                    >
                                        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {isRTL ? `${productsPagesData.page} من ${productsPagesData.totalPages}` : `${productsPagesData.page} of ${productsPagesData.totalPages}`}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={!productsPagesData.hasNextPage}
                                    >
                                        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Products Pages Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isRTL ? 'إضافة صفحة منتجات جديدة' : 'Add New Products Page'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'أدخل معلومات صفحة المنتجات الجديدة وترجماتها وفئات المنتجات المضمنة' : 'Enter the details for the new products page, its translations and included product categories'}
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
                                                        placeholder={isRTL ? 'مثال: products-home, featured-products' : 'e.g., products-home, featured-products'}
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
                                                        placeholder={isRTL ? 'مثال: الصفحة الرئيسية للمنتجات' : 'e.g., Products Home Page'}
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
                                                    placeholder={isRTL ? 'وصف صفحة المنتجات' : 'Products page description'}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={createForm.control}
                                    name="includedProductCategoryIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Tags className="h-4 w-4 text-primary" />
                                                {isRTL ? 'فئات المنتجات المضمنة' : 'Included Product Categories'}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    value={field.value?.map(String) || []}
                                                    onValueChange={(values) => field.onChange(values.map(Number))}
                                                    placeholder={isRTL ? 'اختر فئات المنتجات المضمنة' : 'Select product categories'}
                                                    searchPlaceholder={isRTL ? 'البحث في الفئات...' : 'Search categories...'}
                                                    emptyText={isRTL ? 'لا توجد فئات متاحة' : 'No categories found'}
                                                    maxDisplay={2}
                                                    options={productCategoriesData?.map(category => ({
                                                        value: category.id.toString(),
                                                        label: category.name
                                                    })) || []}
                                                    className={isRTL ? 'text-right' : 'text-left'}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {isRTL ? 'يمكنك اختيار عدة فئات منتجات لتضمينها في هذه الصفحة' : 'You can select multiple product categories to include in this page'}
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

                {/* Edit Products Pages Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {isRTL ? 'تحرير صفحة المنتجات' : 'Edit Products Page'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'قم بتحديث معلومات صفحة المنتجات وترجماتها وفئات المنتجات المضمنة' : 'Update the products page details, translations and included product categories'}
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
                                                    {isRTL ? 'تفعيل أو إلغاء تفعيل صفحة المنتجات' : 'Enable or disable this products page'}
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
                                    name="includedProductCategoryIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Tags className="h-4 w-4 text-primary" />
                                                {isRTL ? 'فئات المنتجات المضمنة' : 'Included Product Categories'}
                                            </FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    value={field.value?.map(String) || []}
                                                    onValueChange={(values) => field.onChange(values.map(Number))}
                                                    placeholder={isRTL ? 'اختر فئات المنتجات المضمنة' : 'Select product categories'}
                                                    searchPlaceholder={isRTL ? 'البحث في الفئات...' : 'Search categories...'}
                                                    emptyText={isRTL ? 'لا توجد فئات متاحة' : 'No categories found'}
                                                    maxDisplay={2}
                                                    options={productCategoriesData?.map(category => ({
                                                        value: category.id.toString(),
                                                        label: category.name
                                                    })) || []}
                                                    className={isRTL ? 'text-right' : 'text-left'}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {isRTL ? 'يمكنك تحديث فئات المنتجات المضمنة في هذه الصفحة' : 'You can update the product categories included in this page'}
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

                {/* Products Pages Details Dialog */}
                <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary-foreground" />
                                </div>
                                {isRTL ? 'تفاصيل صفحة المنتجات' : 'Products Page Details'}
                            </DialogTitle>
                            <DialogDescription>
                                {isRTL ? 'عرض شامل لمعلومات صفحة المنتجات وترجماتها وفئات المنتجات المضمنة' : 'Comprehensive view of products page information, translations and included product categories'}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedProductsPagesForDetails && (
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
                                                    <span className="text-sm font-mono font-medium">{selectedProductsPagesForDetails.key}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'اسم الصفحة' : 'Page Name'}
                                                </label>
                                                <div className="p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm font-medium">{selectedProductsPagesForDetails.name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'الحالة' : 'Status'}
                                                </label>
                                                <div className="p-3">
                                                    {getStatusBadge(selectedProductsPagesForDetails.isActive)}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                                                </label>
                                                <div className="p-3 bg-muted/50 rounded-lg">
                                                    <span className="text-sm">{formatDate(selectedProductsPagesForDetails.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                {isRTL ? 'الوصف' : 'Description'}
                                            </label>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <p className="text-sm leading-relaxed">
                                                    {selectedProductsPagesForDetails.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Included Product Categories */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Tags className="h-5 w-5 text-primary" />
                                            {isRTL ? 'فئات المنتجات المضمنة' : 'Included Product Categories'}
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedProductsPagesForDetails.includedProductTypes.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProductsPagesForDetails.includedProductTypes.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">
                                                    {isRTL ? 'لا توجد فئات منتجات مضمنة في هذه الصفحة' : 'No product categories included in this page'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {selectedProductsPagesForDetails.includedProductTypes.map((includedType) => (
                                                    <Card key={includedType.id} className="border border-border/50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <Tags className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium text-sm">
                                                                            {includedType.productCategory.name}
                                                                        </h4>
                                                                    </div>
                                                                </div>
                                                                {getStatusBadge(includedType.isActive)}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="p-3 bg-muted/30 rounded-lg">
                                                                    <p className="text-sm">
                                                                        {includedType.productCategory.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                                                                <span>{isRTL ? 'تاريخ الإضافة:' : 'Added:'} {formatDate(includedType.createdAt)}</span>
                                                                <span>ID: {includedType.productCategory.id}</span>
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
                                                {selectedProductsPagesForDetails.localizations.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProductsPagesForDetails.localizations.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                                <p className="text-muted-foreground">
                                                    {isRTL ? 'لا توجد ترجمات متاحة لصفحة المنتجات هذه' : 'No translations available for this products page'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedProductsPagesForDetails.localizations.map((localization, index) => (
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
                                            {isRTL ? 'إحصائيات صفحة المنتجات' : 'Products Page Statistics'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    {selectedProductsPagesForDetails.localizations.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-primary mb-1">
                                                    {selectedProductsPagesForDetails.localizations.filter(l => l.isActive).length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                                    {selectedProductsPagesForDetails.includedProductTypes.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {isRTL ? 'فئات المنتجات' : 'Product Categories'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600 mb-1">
                                                    {selectedProductsPagesForDetails.key.length}
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
                                    setSelectedProductsPagesForDetails(null);
                                }}
                            >
                                {isRTL ? 'إغلاق' : 'Close'}
                            </Button>
                            <Button
                                type="button"
                                className="gradient-primary"
                                onClick={() => {
                                    if (selectedProductsPagesForDetails) {
                                        handleEdit(selectedProductsPagesForDetails);
                                        setIsDetailsDialogOpen(false);
                                        setSelectedProductsPagesForDetails(null);
                                    }
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                {isRTL ? 'تحرير صفحة المنتجات' : 'Edit Products Page'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default ProductsPages;
