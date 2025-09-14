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
  FolderTree,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  Globe,
  Languages as LanguagesIcon,
  Eye,
  X,
  TreePine,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import categoryService, {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateCategoryLocalizedDto,
  UpdateCategoryLocalizedDto,
  PaginatedResult
} from '@/services/categoryService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import MissingTranslationsWarning from '@/components/ui/missing-translations-warning';
import MissingTranslationsModal from '@/components/ui/missing-translations-modal';
import { ImageUpload } from '@/components/ui/image-upload';

// Default placeholder image as data URI - Professional category placeholder
const DEFAULT_CATEGORY_IMAGE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRUZGMUYzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzMuMjUwMyAzOC40ODE2QzMzLjI2MDMgMzcuMDQ3MiAzNC40MTk5IDM1Ljg4NjQgMzUuODU0MyAzNS44NzVIODMuMTQ2M0M4NC41ODQ4IDM1Ljg3NSA4NS43NTAzIDM3LjA0MzEgODUuNzUwMyAzOC40ODE2VjgwLjUxODRDODUuNzQwMyA4MS45NTI4IDg0LjU4MDcgODMuMTEzNiA4My4xNDYzIDgzLjEyNUgzNS44NTQzQzM0LjQxNTggODMuMTIzNiAzMy4yNTAzIDgxLjk1NyAzMy4yNTAzIDgwLjUxODRWMzguNDgxNlpNODAuNTAwNiA0MS4xMjUxSDM4LjUwMDZWNzcuODc1MUw2Mi44OTIxIDUzLjQ3ODNDNjMuOTE3MiA1Mi40NTM2IDY1LjU3ODggNTIuNDUzNiA2Ni42MDM5IDUzLjQ3ODNMODAuNTAwNiA2Ny40MDEzVjQxLjEyNTFaTTQzLjc1IDUxLjYyNDlDNDMuNzUgNTQuNTI0NCA0Ni4xMDA1IDU2Ljg3NDkgNDkgNTYuODc0OUM1MS44OTk1IDU2Ljg3NDkgNTQuMjUgNTQuNTI0NCA1NC4yNSA1MS42MjQ5QzU0LjI1IDQ4LjcyNTQgNTEuODk5NSA0Ni4zNzQ5IDQ5IDQ2LjM3NDlDNDYuMTAwNSA0Ni4zNzQ5IDQzLjc1IDQ4LjcyNTQgNDMuNzUgNTEuNjI0OVoiIGZpbGw9IiM2ODc3ODciLz4KPC9zdmc+";

// Category Avatar Component with error handling and placeholder
const CategoryAvatar: React.FC<{ category: Category | null; size?: 'sm' | 'md' | 'lg' }> = ({ category, size = 'sm' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const imageToShow = (category?.imageUrl && !imageError) ? category.imageUrl : DEFAULT_CATEGORY_IMAGE;

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-2 border-border/20`}>
      <img
        src={imageToShow}
        alt={category?.name || 'Category'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Category Image Preview Component for details dialog
const CategoryImagePreview: React.FC<{ category: Category | null }> = ({ category }) => {
  const [imageError, setImageError] = useState(false);

  const imageToShow = (category?.imageUrl && !imageError) ? category.imageUrl : DEFAULT_CATEGORY_IMAGE;

  return (
    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
      <img
        src={imageToShow}
        alt={category?.name || 'Category'}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

const Categories: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isMissingTranslationsModalOpen, setIsMissingTranslationsModalOpen] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Form setup
  const createForm = useForm<CreateCategoryDto>({
    defaultValues: {
      name: '',
      description: '',
      parentId: null,
      imageUrl: '',
      isActive: true,
      localizations: [],
    },
  });

  const editForm = useForm<UpdateCategoryDto>({
    defaultValues: {
      name: '',
      description: '',
      parentId: null,
      imageUrl: '',
      isActive: true,
      localizations: [],
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

  // Handle navigation state from tree page
  React.useEffect(() => {
    if (location.state?.editCategory) {
      const category = location.state.editCategory as Category;
      setSelectedCategory(category);
      editForm.reset({
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        imageUrl: category.imageUrl || '',
        isActive: category.isActive,
        localizations: category.localizations?.map(loc => ({
          id: loc.id,
          nameLocalized: loc.nameLocalized,
          descriptionLocalized: loc.descriptionLocalized,
          languageId: loc.languageId,
          isActive: loc.isActive,
        })) || [],
      });
      setIsEditDialogOpen(true);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    } else if (location.state?.viewCategory) {
      const category = location.state.viewCategory as Category;
      setSelectedCategoryForDetails(category);
      setIsDetailsDialogOpen(true);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, editForm]);

  // Query for categories data
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories', currentPage, pageSize, statusFilter],
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

      return categoryService.getCategories(params);
    },
  });

  // Query for all categories to calculate stats
  const { data: allCategoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getCategories({ pageSize: 1000 }),
  });

  // Query for categories dropdown (for parent selection)
  const { data: parentCategories } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: () => categoryService.getCategoriesDropdown(),
  });

  // Query for languages dropdown (for localization)
  const { data: languages } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for categories missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['categories-missing-translations'],
    queryFn: () => categoryService.getCategoriesMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] });
      toast.success(isRTL ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء الفئة' : 'Error creating category'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] });
      toast.success(isRTL ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث الفئة' : 'Error updating category'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: categoryService.toggleCategoryActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      toast.success(isRTL ? 'تم تحديث حالة الفئة' : 'Category status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة الفئة' : 'Error updating category status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] });
      toast.success(isRTL ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف الفئة' : 'Error deleting category'));
    },
  });

  // Filter categories client-side for search
  const filteredCategories = categoriesData?.items.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.localizations?.some(loc =>
        loc.nameLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.descriptionLocalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.languageName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allCategoriesData?.totalCount || 0,
    active: allCategoriesData?.items.filter(c => c.isActive).length || 0,
    inactive: allCategoriesData?.items.filter(c => !c.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateCategoryDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateCategoryDto) => {
    if (!selectedCategory) return;
    updateMutation.mutate({ id: selectedCategory.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      imageUrl: category.imageUrl || '',
      isActive: category.isActive,
      localizations: category.localizations?.map(loc => ({
        id: loc.id,
        nameLocalized: loc.nameLocalized,
        descriptionLocalized: loc.descriptionLocalized,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (category: Category) => {
    setSelectedCategoryForDetails(category);
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

  const getParentCategoryName = (parentId: number | null) => {
    if (!parentId || !parentCategories) return '-';
    const parent = parentCategories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة الفئات' : 'Categories Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة فئات المنتجات والخدمات' : 'Manage product and service categories'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/categories/tree')}
            >
              <TreePine className="h-4 w-4" />
              {isRTL ? 'عرض الشجرة' : 'Tree View'}
            </Button>
            <Button
              className="gradient-primary flex items-center gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة فئة جديدة' : 'Add New Category'}
            </Button>
          </div>
        </div>

        {/* Missing Translations Warning */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && !dismissedWarning && (
          <MissingTranslationsWarning
            missingCount={missingTranslationsIds.length}
            onApplyTranslations={() => setIsMissingTranslationsModalOpen(true)}
            onDismiss={() => setDismissedWarning(true)}
            className="mb-6"
          />
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الفئات' : 'Total Categories'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FolderTree className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'الفئات النشطة' : 'Active Categories'}
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
                    {isRTL ? 'الفئات غير النشطة' : 'Inactive Categories'}
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
                  placeholder={isRTL ? 'البحث في الفئات...' : 'Search categories...'}
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
                      <div className={`w-2 h-2 rounded-full ${                        statusFilter === 'active' ? 'bg-primary' : 
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
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-red-500" />
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

        {/* Categories Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredCategories.length} فئة` : `${filteredCategories.length} Categories`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم الفئة' : 'Category Name'}</TableHead>
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
                ) : filteredCategories.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد فئات متاحة' : 'No categories available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                          <CategoryAvatar category={category} />
                          <div>
                            <p className="font-medium">{category.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-sm text-muted-foreground max-w-xs truncate" title={category.description}>
                          {category.description}
                        </p>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <Badge variant="outline">
                          {getParentCategoryName(category.parentId)}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                          {category.localizations?.map((loc) => (
                            <Badge key={loc.id} variant="outline" className="text-xs">
                              <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {loc.languageCode}
                            </Badge>
                          ))}
                          {category.localizations?.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(category.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(category.createdAt)}
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
                              onClick={() => handleShowDetails(category)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => toggleMutation.mutate(category.id)}
                            >
                              <Power className="h-4 w-4" />
                              {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(category.id)}
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
            {categoriesData && categoriesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${((categoriesData.page - 1) * categoriesData.pageSize) + 1} إلى ${Math.min(categoriesData.page * categoriesData.pageSize, categoriesData.totalCount)} من ${categoriesData.totalCount}`
                    : `Showing ${((categoriesData.page - 1) * categoriesData.pageSize) + 1} to ${Math.min(categoriesData.page * categoriesData.pageSize, categoriesData.totalCount)} of ${categoriesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!categoriesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${categoriesData.page} من ${categoriesData.totalPages}` : `${categoriesData.page} of ${categoriesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!categoriesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Category Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة فئة جديدة' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات الفئة الجديدة' : 'Enter the details for the new category'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم الفئة مطلوب' : 'Category name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الفئة' : 'Category Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder={isRTL ? 'مثال: الإلكترونيات' : 'e.g., Electronics'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  rules={{ required: isRTL ? 'وصف الفئة مطلوب' : 'Category description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وصف الفئة' : 'Category Description'}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isRTL ? 'وصف الفئة...' : 'Category description...'}
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
                          {parentCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'صورة الفئة (اختياري)' : 'Category Image (Optional)'}</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ''}
                          onChange={field.onChange}
                          folder="categories"
                          placeholder={isRTL ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                        />
                      </FormControl>
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
                          {isRTL ? 'الفئة نشطة' : 'Active Category'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الفئة' : 'Enable or disable this category'}
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
                                  {languages?.map((lang) => (
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
                          rules={{ required: isRTL ? 'الاسم المترجم مطلوب' : 'Translated name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'الاسم المترجم' : 'Translated Name'}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={isRTL ? 'اسم الفئة بهذه اللغة' : 'Category name in this language'}
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
                          rules={{ required: isRTL ? 'الوصف المترجم مطلوب' : 'Translated description is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'الوصف المترجم' : 'Translated Description'}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={isRTL ? 'وصف الفئة بهذه اللغة' : 'Category description in this language'}
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

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير الفئة' : 'Edit Category'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات الفئة' : 'Update the category details'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم الفئة مطلوب' : 'Category name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الفئة' : 'Category Name'}</FormLabel>
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
                  rules={{ required: isRTL ? 'وصف الفئة مطلوب' : 'Category description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وصف الفئة' : 'Category Description'}</FormLabel>
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
                          {parentCategories?.filter(cat => cat.id !== selectedCategory?.id).map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'صورة الفئة (اختياري)' : 'Category Image (Optional)'}</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ''}
                          onChange={field.onChange}
                          folder="categories"
                          placeholder={isRTL ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                        />
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
                          {isRTL ? 'الفئة نشطة' : 'Active Category'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الفئة' : 'Enable or disable this category'}
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
                                  {languages?.map((lang) => (
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
                          rules={{ required: isRTL ? 'الاسم المترجم مطلوب' : 'Translated name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'الاسم المترجم' : 'Translated Name'}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={isRTL ? 'اسم الفئة بهذه اللغة' : 'Category name in this language'}
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
                          control={editForm.control}
                          name={`localizations.${index}.descriptionLocalized`}
                          rules={{ required: isRTL ? 'الوصف المترجم مطلوب' : 'Translated description is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'الوصف المترجم' : 'Translated Description'}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={isRTL ? 'وصف الفئة بهذه اللغة' : 'Category description in this language'}
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
                          control={editForm.control}
                          name={`localizations.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">
                                  {isRTL ? 'الترجمة نشطة' : 'Translation Active'}
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

        {/* Category Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CategoryAvatar category={selectedCategoryForDetails} size="md" />
                {isRTL ? 'تفاصيل الفئة' : 'Category Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات الفئة وترجماتها' : 'Comprehensive view of category information and translations'}
              </DialogDescription>
            </DialogHeader>

            {selectedCategoryForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Image */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'صورة الفئة' : 'Category Image'}
                      </label>
                      <div className="p-3 bg-muted/50 rounded-lg flex justify-center">
                        <CategoryImagePreview category={selectedCategoryForDetails} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم الفئة' : 'Category Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedCategoryForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedCategoryForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الفئة الأب' : 'Parent Category'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Badge variant="outline">
                            {getParentCategoryName(selectedCategoryForDetails.parentId)}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCategoryForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCategoryForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'وصف الفئة' : 'Category Description'}
                      </label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {selectedCategoryForDetails.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Localizations */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {isRTL ? 'الترجمات' : 'Localizations'}
                      <Badge variant="secondary" className="ml-2">
                        {selectedCategoryForDetails.localizations?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCategoryForDetails.localizations?.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لهذه الفئة' : 'No translations available for this category'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCategoryForDetails.localizations?.map((localization, index) => (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'الاسم المترجم' : 'Translated Name'}
                                    </label>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <p className="text-sm leading-relaxed">
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
                      {isRTL ? 'إحصائيات الفئة' : 'Category Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedCategoryForDetails.localizations?.length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedCategoryForDetails.localizations?.filter(l => l.isActive).length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-secondary-foreground mb-1">
                          {selectedCategoryForDetails.localizations?.filter(l => !l.isActive).length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات غير نشطة' : 'Inactive Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedCategoryForDetails.name.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول الاسم' : 'Name Length'}
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
                  setSelectedCategoryForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedCategoryForDetails) {
                    handleEdit(selectedCategoryForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedCategoryForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير الفئة' : 'Edit Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Missing Translations Modal */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && (
          <MissingTranslationsModal
            isOpen={isMissingTranslationsModalOpen}
            onOpenChange={setIsMissingTranslationsModalOpen}
            missingCategoryIds={missingTranslationsIds}
          />
        )}


      </div>
    </DashboardLayout>
  );
};

export default Categories;
