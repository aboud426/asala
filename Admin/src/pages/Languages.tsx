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
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Globe,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import languageService, { 
  Language, 
  CreateLanguageDto, 
  UpdateLanguageDto,
  PaginatedResult 
} from '@/services/languageService';

const Languages: React.FC = () => {
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // Form setup
  const createForm = useForm<CreateLanguageDto>({
    defaultValues: {
      name: '',
      code: '',
    },
  });

  const editForm = useForm<UpdateLanguageDto>({
    defaultValues: {
      name: '',
      code: '',
      isActive: true,
    },
  });

  // Query for languages data
  const { data: languagesData, isLoading, error } = useQuery({
    queryKey: ['languages', currentPage, pageSize, statusFilter],
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
      
      return languageService.getLanguages(params);
    },
  });

  // Query for all languages to calculate stats
  const { data: allLanguagesData } = useQuery({
    queryKey: ['languages-all'],
    queryFn: () => languageService.getLanguages({ pageSize: 1000 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: languageService.createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages-all'] });
      toast.success(isRTL ? 'تم إنشاء اللغة بنجاح' : 'Language created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء اللغة' : 'Error creating language'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLanguageDto }) => 
      languageService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages-all'] });
      toast.success(isRTL ? 'تم تحديث اللغة بنجاح' : 'Language updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث اللغة' : 'Error updating language'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: languageService.toggleLanguageActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages-all'] });
      toast.success(isRTL ? 'تم تحديث حالة اللغة' : 'Language status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة اللغة' : 'Error updating language status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: languageService.deleteLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages-all'] });
      toast.success(isRTL ? 'تم حذف اللغة بنجاح' : 'Language deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف اللغة' : 'Error deleting language'));
    },
  });

  // Filter languages client-side for search
  const filteredLanguages = languagesData?.items.filter(language => {
    const matchesSearch = language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         language.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allLanguagesData?.totalCount || 0,
    active: allLanguagesData?.items.filter(l => l.isActive).length || 0,
    inactive: allLanguagesData?.items.filter(l => !l.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateLanguageDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateLanguageDto) => {
    if (!selectedLanguage) return;
    updateMutation.mutate({ id: selectedLanguage.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedLanguage(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (language: Language) => {
    setSelectedLanguage(language);
    editForm.reset({
      name: language.name,
      code: language.code,
      isActive: language.isActive,
    });
    setIsEditDialogOpen(true);
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
              {isRTL ? 'إدارة اللغات' : 'Languages Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة اللغات المدعومة في النظام' : 'Manage supported languages in the system'}
            </p>
          </div>
          <Button 
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة لغة جديدة' : 'Add New Language'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي اللغات' : 'Total Languages'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'اللغات النشطة' : 'Active Languages'}
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
                    {isRTL ? 'اللغات غير النشطة' : 'Inactive Languages'}
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
                  placeholder={isRTL ? 'البحث في اللغات...' : 'Search languages...'}
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

        {/* Languages Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredLanguages.length} لغة` : `${filteredLanguages.length} Languages`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'اسم اللغة' : 'Language Name'}</TableHead>
                  <TableHead>{isRTL ? 'الكود' : 'Code'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                  <TableHead>{isRTL ? 'آخر تحديث' : 'Last Updated'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                    </TableCell>
                  </TableRow>
                ) : filteredLanguages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد لغات متاحة' : 'No languages available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLanguages.map((language) => (
                  <TableRow key={language.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{language.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {language.code}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(language.isActive)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(language.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(language.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => handleEdit(language)}
                          >
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2"
                            onClick={() => toggleMutation.mutate(language.id)}
                          >
                            <Power className="h-4 w-4" />
                            {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-destructive"
                            onClick={() => deleteMutation.mutate(language.id)}
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
            {languagesData && languagesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `عرض ${((languagesData.page - 1) * languagesData.pageSize) + 1} إلى ${Math.min(languagesData.page * languagesData.pageSize, languagesData.totalCount)} من ${languagesData.totalCount}`
                    : `Showing ${((languagesData.page - 1) * languagesData.pageSize) + 1} to ${Math.min(languagesData.page * languagesData.pageSize, languagesData.totalCount)} of ${languagesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!languagesData.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${languagesData.page} من ${languagesData.totalPages}` : `${languagesData.page} of ${languagesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!languagesData.hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Language Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة لغة جديدة' : 'Add New Language'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات اللغة الجديدة' : 'Enter the details for the new language'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم اللغة مطلوب' : 'Language name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم اللغة' : 'Language Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder={isRTL ? 'مثال: العربية' : 'e.g., English'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="code"
                  rules={{ 
                    required: isRTL ? 'كود اللغة مطلوب' : 'Language code is required',
                    pattern: {
                      value: /^[a-z]{2}(-[A-Z]{2})?$/,
                      message: isRTL ? 'كود اللغة يجب أن يكون بصيغة صحيحة (مثال: ar, en-US)' : 'Invalid language code format (e.g., ar, en-US)'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'كود اللغة' : 'Language Code'}</FormLabel>
                      <FormControl>
                        <Input placeholder={isRTL ? 'مثال: ar' : 'e.g., en'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

        {/* Edit Language Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير اللغة' : 'Edit Language'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات اللغة' : 'Update the language details'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم اللغة مطلوب' : 'Language name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم اللغة' : 'Language Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="code"
                  rules={{ 
                    required: isRTL ? 'كود اللغة مطلوب' : 'Language code is required',
                    pattern: {
                      value: /^[a-z]{2}(-[A-Z]{2})?$/,
                      message: isRTL ? 'كود اللغة يجب أن يكون بصيغة صحيحة (مثال: ar, en-US)' : 'Invalid language code format (e.g., ar, en-US)'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'كود اللغة' : 'Language Code'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          {isRTL ? 'اللغة نشطة' : 'Active Language'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل اللغة' : 'Enable or disable this language'}
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
      </div>
    </DashboardLayout>
  );
};

export default Languages;
