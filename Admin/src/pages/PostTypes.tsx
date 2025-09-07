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
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Languages as LanguagesIcon,
  Eye,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postTypeService, { 
  PostType, 
  CreatePostTypeDto, 
  UpdatePostTypeDto,
  CreatePostTypeLocalizedDto,
  UpdatePostTypeLocalizedDto,
  PaginatedResult 
} from '@/services/postTypeService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import MissingPostTypeTranslationsWarning from '@/components/ui/missing-post-type-translations-warning';
import MissingPostTypeTranslationsModal from '@/components/ui/missing-post-type-translations-modal';

const PostTypes: React.FC = () => {
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);
  const [selectedPostTypeForDetails, setSelectedPostTypeForDetails] = useState<PostType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isMissingTranslationsModalOpen, setIsMissingTranslationsModalOpen] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Form setup
  const createForm = useForm<CreatePostTypeDto>({
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      localizations: [],
    },
  });

  const editForm = useForm<UpdatePostTypeDto>({
    defaultValues: {
      name: '',
      description: '',
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

  // Query for post types data
  const { data: postTypesData, isLoading, error } = useQuery({
    queryKey: ['postTypes', currentPage, pageSize, statusFilter],
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
      
      return postTypeService.getPostTypes(params);
    },
  });

  // Query for all post types to calculate stats
  const { data: allPostTypesData } = useQuery({
    queryKey: ['postTypes-all'],
    queryFn: () => postTypeService.getPostTypes({ pageSize: 1000 }),
  });

  // Query for languages dropdown
  const { data: languagesData } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for post types missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['postTypes-missing-translations'],
    queryFn: () => postTypeService.getPostTypesMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: postTypeService.createPostType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postTypes'] });
      queryClient.invalidateQueries({ queryKey: ['postTypes-all'] });
      toast.success(isRTL ? 'تم إنشاء نوع المنشور بنجاح' : 'Post type created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء نوع المنشور' : 'Error creating post type'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostTypeDto }) => 
      postTypeService.updatePostType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postTypes'] });
      queryClient.invalidateQueries({ queryKey: ['postTypes-all'] });
      toast.success(isRTL ? 'تم تحديث نوع المنشور بنجاح' : 'Post type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث نوع المنشور' : 'Error updating post type'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: postTypeService.togglePostTypeActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postTypes'] });
      queryClient.invalidateQueries({ queryKey: ['postTypes-all'] });
      toast.success(isRTL ? 'تم تحديث حالة نوع المنشور' : 'Post type status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة نوع المنشور' : 'Error updating post type status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: postTypeService.deletePostType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postTypes'] });
      queryClient.invalidateQueries({ queryKey: ['postTypes-all'] });
      toast.success(isRTL ? 'تم حذف نوع المنشور بنجاح' : 'Post type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف نوع المنشور' : 'Error deleting post type'));
    },
  });

  // Filter post types client-side for search
  const filteredPostTypes = postTypesData?.items.filter(postType => {
    const matchesSearch = postType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         postType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         postType.localizations.some(loc => 
                           loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loc.languageName.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allPostTypesData?.totalCount || 0,
    active: allPostTypesData?.items.filter(pt => pt.isActive).length || 0,
    inactive: allPostTypesData?.items.filter(pt => !pt.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreatePostTypeDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdatePostTypeDto) => {
    if (!selectedPostType) return;
    updateMutation.mutate({ id: selectedPostType.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedPostType(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (postType: PostType) => {
    setSelectedPostType(postType);
    editForm.reset({
      name: postType.name,
      description: postType.description,
      isActive: postType.isActive,
      localizations: postType.localizations.map(loc => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (postType: PostType) => {
    setSelectedPostTypeForDetails(postType);
    setIsDetailsDialogOpen(true);
  };

  const addNewLocalization = (isEdit: boolean = false) => {
    const newLocalization = {
      name: '',
      description: '',
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
              {isRTL ? 'إدارة أنواع المنشورات' : 'Post Types Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة أنواع المنشورات وترجماتها' : 'Manage post types and their translations'}
            </p>
          </div>
          <Button 
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة نوع منشور جديد' : 'Add New Post Type'}
          </Button>
        </div>

        {/* Missing Translations Warning */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && !dismissedWarning && (
          <MissingPostTypeTranslationsWarning
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
                    {isRTL ? 'إجمالي الأنواع' : 'Total Post Types'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Tag className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'الأنواع النشطة' : 'Active Types'}
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
                    {isRTL ? 'الأنواع غير النشطة' : 'Inactive Types'}
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
                  placeholder={isRTL ? 'البحث في أنواع المنشورات...' : 'Search post types...'}
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

        {/* Post Types Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredPostTypes.length} نوع منشور` : `${filteredPostTypes.length} Post Types`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم النوع' : 'Type Name'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الترجمات' : 'Localizations'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className={isRTL ? 'mr-2' : 'ml-2'}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                    </TableCell>
                  </TableRow>
                ) : filteredPostTypes.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد أنواع منشورات متاحة' : 'No post types available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPostTypes.map((postType) => (
                    <TableRow key={postType.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                            <Tag className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{postType.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={postType.description}>
                            {postType.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                          {postType.localizations.map((loc) => (
                            <Badge key={loc.id} variant="outline" className="text-xs">
                              <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {loc.languageCode}
                            </Badge>
                          ))}
                          {postType.localizations.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(postType.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(postType.createdAt)}
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
                              onClick={() => handleShowDetails(postType)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(postType)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => toggleMutation.mutate(postType.id)}
                            >
                              <Power className="h-4 w-4" />
                              {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(postType.id)}
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
            {postTypesData && postTypesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `عرض ${((postTypesData.page - 1) * postTypesData.pageSize) + 1} إلى ${Math.min(postTypesData.page * postTypesData.pageSize, postTypesData.totalCount)} من ${postTypesData.totalCount}`
                    : `Showing ${((postTypesData.page - 1) * postTypesData.pageSize) + 1} to ${Math.min(postTypesData.page * postTypesData.pageSize, postTypesData.totalCount)} of ${postTypesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!postTypesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${postTypesData.page} من ${postTypesData.totalPages}` : `${postTypesData.page} of ${postTypesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!postTypesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Post Type Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة نوع منشور جديد' : 'Add New Post Type'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات نوع المنشور الجديد وترجماته' : 'Enter the details for the new post type and its translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم النوع مطلوب' : 'Type name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم النوع' : 'Type Name'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isRTL ? 'مثال: مقالة، صورة، فيديو' : 'e.g., Article, Image, Video'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={isRTL ? 'وصف نوع المنشور' : 'Post type description'} 
                          {...field} 
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
                          {isRTL ? 'النوع نشط' : 'Active Type'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل نوع المنشور' : 'Enable or disable this post type'}
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
                          name={`localizations.${index}.name`}
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
                          name={`localizations.${index}.description`}
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

        {/* Edit Post Type Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير نوع المنشور' : 'Edit Post Type'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات نوع المنشور وترجماته' : 'Update the post type details and translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم النوع مطلوب' : 'Type name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم النوع' : 'Type Name'}</FormLabel>
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
                          {isRTL ? 'النوع نشط' : 'Active Type'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل نوع المنشور' : 'Enable or disable this post type'}
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
                          name={`localizations.${index}.name`}
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
                          name={`localizations.${index}.description`}
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

        {/* Post Type Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل نوع المنشور' : 'Post Type Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات نوع المنشور وترجماته' : 'Comprehensive view of post type information and translations'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPostTypeForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم النوع' : 'Type Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedPostTypeForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedPostTypeForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedPostTypeForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedPostTypeForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'الوصف' : 'Description'}
                      </label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {selectedPostTypeForDetails.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
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
                        {selectedPostTypeForDetails.localizations.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPostTypeForDetails.localizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لنوع المنشور هذا' : 'No translations available for this post type'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPostTypeForDetails.localizations.map((localization, index) => (
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
                                      {localization.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    {isRTL ? 'الوصف المترجم' : 'Translated Description'}
                                  </label>
                                  <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {localization.description}
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
                      {isRTL ? 'إحصائيات نوع المنشور' : 'Post Type Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedPostTypeForDetails.localizations.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                          {selectedPostTypeForDetails.localizations.filter(l => l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {selectedPostTypeForDetails.localizations.filter(l => !l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات غير نشطة' : 'Inactive Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedPostTypeForDetails.name.length}
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
                  setSelectedPostTypeForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedPostTypeForDetails) {
                    handleEdit(selectedPostTypeForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedPostTypeForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير نوع المنشور' : 'Edit Post Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Missing Translations Modal */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && (
          <MissingPostTypeTranslationsModal
            isOpen={isMissingTranslationsModalOpen}
            onOpenChange={setIsMissingTranslationsModalOpen}
            missingPostTypeIds={missingTranslationsIds}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PostTypes;
