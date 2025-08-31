import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Globe,
  Languages as LanguagesIcon,
  Eye,
  X,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productCategoryService, { 
  ProductCategory, 
  CreateProductCategoryDto, 
  UpdateProductCategoryDto,
  CreateProductCategoryLocalizedDto,
  UpdateProductCategoryLocalizedDto,
  PaginatedResult 
} from '@/services/productCategoryService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

const ProductCategories: React.FC = () => {
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null);
  const [selectedProductCategoryForDetails, setSelectedProductCategoryForDetails] = useState<ProductCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Form setup
  const createForm = useForm<CreateProductCategoryDto>({
    defaultValues: {
      name: '',
      description: '',
      parentId: null,
      isActive: true,
      localizations: [],
    },
  });

  const editForm = useForm<UpdateProductCategoryDto>({
    defaultValues: {
      name: '',
      description: '',
      parentId: null,
      isActive: true,
      localizations: [],
    },
  });

  // Field arrays for localizations
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

  // Query for product categories data
  const { data: productCategoriesData, isLoading, error } = useQuery({
    queryKey: ['product-categories', currentPage, pageSize, statusFilter],
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
      // For 'all' status, don't include activeOnly parameter at all
      
      return productCategoryService.getProductCategories(params);
    },
  });

  // Query for all product categories to calculate stats
  const { data: allProductCategoriesData } = useQuery({
    queryKey: ['product-categories-all'],
    queryFn: () => productCategoryService.getProductCategories({ pageSize: 1000 }),
  });

  // Query for product categories dropdown (for parent selection)
  const { data: parentProductCategories } = useQuery({
    queryKey: ['product-categories-dropdown'],
    queryFn: () => productCategoryService.getProductCategoriesDropdown(),
  });

  // Query for languages dropdown
  const { data: languages } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: productCategoryService.createProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-dropdown'] });
      toast.success(isRTL ? 'تم إنشاء فئة المنتج بنجاح' : 'Product category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء فئة المنتج' : 'Error creating product category'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductCategoryDto }) => 
      productCategoryService.updateProductCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-dropdown'] });
      toast.success(isRTL ? 'تم تحديث فئة المنتج بنجاح' : 'Product category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث فئة المنتج' : 'Error updating product category'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: productCategoryService.toggleProductCategoryActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
      toast.success(isRTL ? 'تم تحديث حالة فئة المنتج' : 'Product category status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة فئة المنتج' : 'Error updating product category status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productCategoryService.deleteProductCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories-dropdown'] });
      toast.success(isRTL ? 'تم حذف فئة المنتج بنجاح' : 'Product category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف فئة المنتج' : 'Error deleting product category'));
    },
  });

  // Filter product categories client-side for search
  const filteredProductCategories = productCategoriesData?.items.filter(productCategory => {
    const matchesSearch = productCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productCategory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productCategory.localizations?.some(loc => 
                           loc.nameLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loc.descriptionLocalized.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allProductCategoriesData?.totalCount || 0,
    active: allProductCategoriesData?.items.filter(c => c.isActive).length || 0,
    inactive: allProductCategoriesData?.items.filter(c => !c.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateProductCategoryDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateProductCategoryDto) => {
    if (!selectedProductCategory) return;
    updateMutation.mutate({ id: selectedProductCategory.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedProductCategory(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (productCategory: ProductCategory) => {
    setSelectedProductCategory(productCategory);
    editForm.reset({
      name: productCategory.name,
      description: productCategory.description,
      parentId: productCategory.parentId,
      isActive: productCategory.isActive,
      localizations: productCategory.localizations?.map(loc => ({
        id: loc.id,
        nameLocalized: loc.nameLocalized,
        descriptionLocalized: loc.descriptionLocalized,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (productCategory: ProductCategory) => {
    setSelectedProductCategoryForDetails(productCategory);
    setIsDetailsDialogOpen(true);
  };

  // Localization helpers
  const addNewLocalization = (isEdit: boolean = false) => {
    const availableLanguages = languages?.filter(lang => {
      const currentLocalizations = isEdit ? editLocalizations : createLocalizations;
      return !currentLocalizations.some(loc => loc.languageId === lang.id);
    });

    if (!availableLanguages || availableLanguages.length === 0) {
      toast.warning(isRTL ? 'تم إضافة جميع اللغات المتاحة' : 'All available languages have been added');
      return;
    }

    const newLocalization: CreateProductCategoryLocalizedDto = {
      nameLocalized: '',
      descriptionLocalized: '',
      languageId: availableLanguages[0].id,
    };

    if (isEdit) {
      appendEditLocalization({
        ...newLocalization,
        id: null,
        isActive: true,
      });
    } else {
      appendCreateLocalization(newLocalization);
    }
  };

  const getLanguageName = (languageId: number) => {
    return languages?.find(lang => lang.id === languageId)?.name || 'Unknown';
  };

  const getLanguageCode = (languageId: number) => {
    return languages?.find(lang => lang.id === languageId)?.code || 'N/A';
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

  const getParentProductCategoryName = (parentId: number | null) => {
    if (!parentId || !parentProductCategories) return '-';
    const parent = parentProductCategories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة فئات المنتجات' : 'Product Categories Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة فئات المنتجات وتصنيفاتها' : 'Manage product categories and classifications'}
            </p>
          </div>
          <Button 
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة فئة منتج جديدة' : 'Add New Product Category'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي فئات المنتجات' : 'Total Product Categories'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'فئات المنتجات النشطة' : 'Active Product Categories'}
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
                    {isRTL ? 'فئات المنتجات غير النشطة' : 'Inactive Product Categories'}
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
                  placeholder={isRTL ? 'البحث في فئات المنتجات...' : 'Search product categories...'}
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
                      <div className={`w-2 h-2 rounded-full ${
                        statusFilter === 'active' ? 'bg-emerald-500' : 
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

        {/* Product Categories Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredProductCategories.length} فئة منتج` : `${filteredProductCategories.length} Product Categories`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم فئة المنتج' : 'Product Category Name'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الفئة الأب' : 'Parent Category'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الترجمات' : 'Localizations'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className={isRTL ? 'mr-2' : 'ml-2'}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                    </TableCell>
                  </TableRow>
                ) : filteredProductCategories.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد فئات منتجات متاحة' : 'No product categories available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProductCategories.map((productCategory) => (
                  <TableRow key={productCategory.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{productCategory.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-sm text-muted-foreground max-w-xs truncate" title={productCategory.description}>
                        {productCategory.description}
                      </p>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge variant="outline">
                        {getParentProductCategoryName(productCategory.parentId)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="flex flex-wrap gap-1">
                        {productCategory.localizations && productCategory.localizations.length > 0 ? (
                          productCategory.localizations.slice(0, 3).map((localization) => (
                            <Badge 
                              key={localization.id} 
                              variant="secondary" 
                              className="text-xs flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              {localization.languageCode}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                          </span>
                        )}
                        {productCategory.localizations && productCategory.localizations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{productCategory.localizations.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(productCategory.isActive)}</TableCell>
                    <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                      {formatDate(productCategory.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                          <DropdownMenuItem 
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => handleShowDetails(productCategory)}
                          >
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => handleEdit(productCategory)}
                          >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => toggleMutation.mutate(productCategory.id)}
                          >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                            onClick={() => deleteMutation.mutate(productCategory.id)}
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
            {productCategoriesData && productCategoriesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `عرض ${((productCategoriesData.page - 1) * productCategoriesData.pageSize) + 1} إلى ${Math.min(productCategoriesData.page * productCategoriesData.pageSize, productCategoriesData.totalCount)} من ${productCategoriesData.totalCount}`
                    : `Showing ${((productCategoriesData.page - 1) * productCategoriesData.pageSize) + 1} to ${Math.min(productCategoriesData.page * productCategoriesData.pageSize, productCategoriesData.totalCount)} of ${productCategoriesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!productCategoriesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${productCategoriesData.page} من ${productCategoriesData.totalPages}` : `${productCategoriesData.page} of ${productCategoriesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!productCategoriesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Product Category Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة فئة منتج جديدة' : 'Add New Product Category'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات فئة المنتج الجديدة' : 'Enter the details for the new product category'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم فئة المنتج مطلوب' : 'Product category name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم فئة المنتج' : 'Product Category Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder={isRTL ? 'مثال: الهواتف الذكية' : 'e.g., Smartphones'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  rules={{ required: isRTL ? 'وصف فئة المنتج مطلوب' : 'Product category description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وصف فئة المنتج' : 'Product Category Description'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={isRTL ? 'وصف فئة المنتج...' : 'Product category description...'} 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الفئة الأب (اختياري)' : 'Parent Category (Optional)'}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))} value={field.value?.toString() || 'null'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر الفئة الأب' : 'Select parent category'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">{isRTL ? 'لا يوجد (فئة رئيسية)' : 'None (Root category)'}</SelectItem>
                          {parentProductCategories?.map((productCategory) => (
                            <SelectItem key={productCategory.id} value={productCategory.id.toString()}>
                              {productCategory.name}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'فئة المنتج نشطة' : 'Active Product Category'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل فئة المنتج' : 'Enable or disable this product category'}
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

                {/* Localizations Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LanguagesIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {isRTL ? 'الترجمات' : 'Localizations'}
                      </h3>
                      <Badge variant="secondary">{createLocalizations.length}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addNewLocalization(false)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                    </Button>
                  </div>

                  {createLocalizations.length > 0 ? (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {createLocalizations.map((field, index) => (
                        <Card key={field.id} className="border-l-4 border-l-primary/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {getLanguageCode(createForm.watch(`localizations.${index}.languageId`))}
                                </Badge>
                                <span className="font-medium">
                                  {getLanguageName(createForm.watch(`localizations.${index}.languageId`))}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCreateLocalization(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
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
                                          <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select language'} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {languages?.map((language) => (
                                          <SelectItem 
                                            key={language.id} 
                                            value={language.id.toString()}
                                            disabled={createLocalizations.some((loc, i) => i !== index && loc.languageId === language.id)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Globe className="h-3 w-3" />
                                              {language.name} ({language.code})
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
                                rules={{ required: isRTL ? 'الاسم المترجم مطلوب' : 'Localized name is required' }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{isRTL ? 'الاسم المترجم' : 'Localized Name'}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={createForm.control}
                              name={`localizations.${index}.descriptionLocalized`}
                              rules={{ required: isRTL ? 'الوصف المترجم مطلوب' : 'Localized description is required' }}
                              render={({ field }) => (
                                <FormItem className="mt-4">
                                  <FormLabel>{isRTL ? 'الوصف المترجم' : 'Localized Description'}</FormLabel>
                                  <FormControl>
                                    <Textarea rows={2} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                      <LanguagesIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{isRTL ? 'لا توجد ترجمات. اضغط "إضافة ترجمة" للبدء.' : 'No translations added. Click "Add Translation" to start.'}</p>
                    </div>
                  )}
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

        {/* Edit Product Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير فئة المنتج' : 'Edit Product Category'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات فئة المنتج' : 'Update the product category details'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم فئة المنتج مطلوب' : 'Product category name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم فئة المنتج' : 'Product Category Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  rules={{ required: isRTL ? 'وصف فئة المنتج مطلوب' : 'Product category description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وصف فئة المنتج' : 'Product Category Description'}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الفئة الأب (اختياري)' : 'Parent Category (Optional)'}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))} value={field.value?.toString() || 'null'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر الفئة الأب' : 'Select parent category'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">{isRTL ? 'لا يوجد (فئة رئيسية)' : 'None (Root category)'}</SelectItem>
                          {parentProductCategories?.filter(cat => cat.id !== selectedProductCategory?.id).map((productCategory) => (
                            <SelectItem key={productCategory.id} value={productCategory.id.toString()}>
                              {productCategory.name}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'فئة المنتج نشطة' : 'Active Product Category'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل فئة المنتج' : 'Enable or disable this product category'}
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

                {/* Localizations Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LanguagesIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {isRTL ? 'الترجمات' : 'Localizations'}
                      </h3>
                      <Badge variant="secondary">{editLocalizations.length}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addNewLocalization(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                    </Button>
                  </div>

                  {editLocalizations.length > 0 ? (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {editLocalizations.map((field, index) => (
                        <Card key={field.id} className="border-l-4 border-l-primary/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {getLanguageCode(editForm.watch(`localizations.${index}.languageId`))}
                                </Badge>
                                <span className="font-medium">
                                  {getLanguageName(editForm.watch(`localizations.${index}.languageId`))}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEditLocalization(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
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
                                          <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select language'} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {languages?.map((language) => (
                                          <SelectItem 
                                            key={language.id} 
                                            value={language.id.toString()}
                                            disabled={editLocalizations.some((loc, i) => i !== index && loc.languageId === language.id)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <Globe className="h-3 w-3" />
                                              {language.name} ({language.code})
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
                                rules={{ required: isRTL ? 'الاسم المترجم مطلوب' : 'Localized name is required' }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{isRTL ? 'الاسم المترجم' : 'Localized Name'}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              <FormField
                                control={editForm.control}
                                name={`localizations.${index}.descriptionLocalized`}
                                rules={{ required: isRTL ? 'الوصف المترجم مطلوب' : 'Localized description is required' }}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{isRTL ? 'الوصف المترجم' : 'Localized Description'}</FormLabel>
                                    <FormControl>
                                      <Textarea rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={editForm.control}
                                name={`localizations.${index}.isActive`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-sm font-medium">
                                        {isRTL ? 'ترجمة نشطة' : 'Active Translation'}
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                      <LanguagesIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{isRTL ? 'لا توجد ترجمات. اضغط "إضافة ترجمة" للبدء.' : 'No translations added. Click "Add Translation" to start.'}</p>
                    </div>
                  )}
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

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {isRTL ? 'تفاصيل فئة المنتج' : 'Product Category Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedProductCategoryForDetails?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProductCategoryForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الاسم' : 'Name'}
                        </label>
                        <p className="font-medium">{selectedProductCategoryForDetails.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="mt-1">{getStatusBadge(selectedProductCategoryForDetails.isActive)}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'الوصف' : 'Description'}
                      </label>
                      <p className="mt-1 text-sm bg-muted/30 p-3 rounded-md">
                        {selectedProductCategoryForDetails.description}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الفئة الأب' : 'Parent Category'}
                        </label>
                        <p className="font-medium">
                          {getParentProductCategoryName(selectedProductCategoryForDetails.parentId)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <p className="font-medium">
                          {formatDate(selectedProductCategoryForDetails.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Localizations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LanguagesIcon className="h-4 w-4" />
                      {isRTL ? 'الترجمات' : 'Localizations'} 
                      <Badge variant="secondary" className="ml-2">
                        {selectedProductCategoryForDetails.localizations?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProductCategoryForDetails.localizations && selectedProductCategoryForDetails.localizations.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProductCategoryForDetails.localizations.map((localization) => (
                          <Card key={localization.id} className="border-l-4 border-l-primary/20">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {localization.languageCode}
                                  </Badge>
                                  <span className="font-medium">{localization.languageName}</span>
                                </div>
                                {getStatusBadge(localization.isActive)}
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'الاسم المترجم' : 'Localized Name'}
                                  </label>
                                  <p className="mt-1 font-medium">{localization.nameLocalized}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    {isRTL ? 'تاريخ التحديث' : 'Updated Date'}
                                  </label>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {formatDate(localization.updatedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                  {isRTL ? 'الوصف المترجم' : 'Localized Description'}
                                </label>
                                <p className="mt-1 text-sm bg-muted/30 p-3 rounded-md">
                                  {localization.descriptionLocalized}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <LanguagesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{isRTL ? 'لا توجد ترجمات متاحة' : 'No localizations available'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductCategories;
