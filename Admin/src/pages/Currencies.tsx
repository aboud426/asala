import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Coins,
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
import currencyService, {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CreateCurrencyLocalizedDto,
  UpdateCurrencyLocalizedDto,
  PaginatedResult
} from '@/services/currencyService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import MissingCurrencyTranslationsWarning from '@/components/ui/missing-currency-translations-warning';
import MissingCurrencyTranslationsModal from '@/components/ui/missing-currency-translations-modal';

const Currencies: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [selectedCurrencyForDetails, setSelectedCurrencyForDetails] = useState<Currency | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isMissingTranslationsModalOpen, setIsMissingTranslationsModalOpen] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Form setup
  const createForm = useForm<CreateCurrencyDto>({
    defaultValues: {
      name: '',
      code: '',
      symbol: '',
      localizations: [],
    },
  });

  const editForm = useForm<UpdateCurrencyDto>({
    defaultValues: {
      name: '',
      code: '',
      symbol: '',
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

  // Query for currencies data
  const { data: currenciesData, isLoading, error } = useQuery({
    queryKey: ['currencies', currentPage, pageSize, statusFilter],
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

      return currencyService.getCurrencies(params);
    },
  });

  // Query for all currencies to calculate stats
  const { data: allCurrenciesData } = useQuery({
    queryKey: ['currencies-all'],
    queryFn: () => currencyService.getCurrencies({ pageSize: 1000 }),
  });

  // Query for languages dropdown
  const { data: languagesData } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for currencies missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['currencies-missing-translations'],
    queryFn: () => currencyService.getCurrenciesMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: currencyService.createCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-all'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-missing-translations'] });
      toast.success(isRTL ? 'تم إنشاء العملة بنجاح' : 'Currency created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating currency:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء العملة' : 'Error creating currency'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCurrencyDto }) => 
      currencyService.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-all'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-missing-translations'] });
      toast.success(isRTL ? 'تم تحديث العملة بنجاح' : 'Currency updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating currency:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث العملة' : 'Error updating currency'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: currencyService.toggleCurrencyActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-all'] });
      toast.success(isRTL ? 'تم تحديث حالة العملة' : 'Currency status updated');
    },
    onError: (error: Error) => {
      console.error('Error toggling currency status:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة العملة' : 'Error updating currency status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: currencyService.deleteCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-all'] });
      queryClient.invalidateQueries({ queryKey: ['currencies-missing-translations'] });
      toast.success(isRTL ? 'تم حذف العملة بنجاح' : 'Currency deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting currency:', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف العملة' : 'Error deleting currency'));
    },
  });

  // Filter currencies client-side for search
  const filteredCurrencies = currenciesData?.items.filter(currency => {
    const matchesSearch = currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.localizations.some(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.language?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allCurrenciesData?.totalCount || 0,
    active: allCurrenciesData?.items.filter(c => c.isActive).length || 0,
    inactive: allCurrenciesData?.items.filter(c => !c.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateCurrencyDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset({
          name: '',
          code: '',
          symbol: '',
          localizations: [],
        });
      },
    });
  };

  const onEditSubmit = async (data: UpdateCurrencyDto) => {
    if (!selectedCurrency) return;
    updateMutation.mutate({ id: selectedCurrency.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedCurrency(null);
        editForm.reset({
          name: '',
          code: '',
          symbol: '',
          isActive: true,
          localizations: [],
        });
      },
    });
  };

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    editForm.reset({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      isActive: currency.isActive,
      localizations: currency.localizations.map(loc => ({
        id: loc.id,
        languageId: loc.languageId,
        name: loc.name,
        code: loc.code,
        symbol: loc.symbol,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (currency: Currency) => {
    setSelectedCurrencyForDetails(currency);
    setIsDetailsDialogOpen(true);
  };

  const addNewLocalization = (isEdit: boolean = false) => {
    const newLocalization = isEdit
      ? {
        id: 0, // 0 indicates new localization
        languageId: 0,
        name: '',
        code: '',
        symbol: '',
      }
      : {
        languageId: 0,
        name: '',
        code: '',
        symbol: '',
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
              {isRTL ? 'إدارة العملات' : 'Currencies Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة العملات وترجماتها' : 'Manage currencies and their translations'}
            </p>
          </div>
          <Button
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة عملة جديدة' : 'Add New Currency'}
          </Button>
        </div>

        {/* Missing Translations Warning */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && !dismissedWarning && (
          <MissingCurrencyTranslationsWarning
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
                    {isRTL ? 'إجمالي العملات' : 'Total Currencies'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'العملات النشطة' : 'Active Currencies'}
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
                    {isRTL ? 'العملات غير النشطة' : 'Inactive Currencies'}
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
                  placeholder={isRTL ? 'البحث في العملات...' : 'Search currencies...'}
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

        {/* Currencies Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredCurrencies.length} عملة` : `${filteredCurrencies.length} Currencies`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم العملة' : 'Currency Name'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الرمز' : 'Code'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الرمز' : 'Symbol'}</TableHead>
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
                ) : filteredCurrencies.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد عملات متاحة' : 'No currencies available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCurrencies.map((currency) => (
                    <TableRow key={currency.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                            <Coins className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{currency.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {currency.code}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="text-lg font-semibold">{currency.symbol}</span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                          {currency.localizations.map((loc) => (
                            <Badge key={loc.id} variant="outline" className="text-xs">
                              <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {loc.language?.code}
                            </Badge>
                          ))}
                          {currency.localizations.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(currency.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(currency.createdAt)}
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
                              onClick={() => handleShowDetails(currency)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(currency)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => toggleMutation.mutate(currency.id)}
                              disabled={toggleMutation.isPending}
                            >
                              {toggleMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                              {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(currency.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
            {currenciesData && currenciesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${((currenciesData.page - 1) * currenciesData.pageSize) + 1} إلى ${Math.min(currenciesData.page * currenciesData.pageSize, currenciesData.totalCount)} من ${currenciesData.totalCount}`
                    : `Showing ${((currenciesData.page - 1) * currenciesData.pageSize) + 1} to ${Math.min(currenciesData.page * currenciesData.pageSize, currenciesData.totalCount)} of ${currenciesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!currenciesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${currenciesData.page} من ${currenciesData.totalPages}` : `${currenciesData.page} of ${currenciesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!currenciesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Currency Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            createForm.reset({
              name: '',
              code: '',
              symbol: '',
              localizations: [],
            });
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة عملة جديدة' : 'Add New Currency'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات العملة الجديدة وترجماتها' : 'Enter the details for the new currency and its translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم العملة مطلوب' : 'Currency name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم العملة' : 'Currency Name'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isRTL ? 'مثال: الدولار الأمريكي' : 'e.g., US Dollar'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="code"
                    rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency code is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Code'}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isRTL ? 'مثال: USD' : 'e.g., USD'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="symbol"
                    rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency symbol is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Symbol'}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isRTL ? 'مثال: $' : 'e.g., $'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          rules={{ required: isRTL ? 'اسم العملة مطلوب' : 'Currency name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اسم العملة' : 'Currency Name'}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={isRTL ? 'اسم العملة بهذه اللغة' : 'Currency name in this language'}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name={`localizations.${index}.code`}
                          rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency code is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Code'}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={isRTL ? 'رمز العملة' : 'Currency code'}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name={`localizations.${index}.symbol`}
                          rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency symbol is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Symbol'}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={isRTL ? 'رمز العملة' : 'Currency symbol'}
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
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      createForm.reset({
                        name: '',
                        code: '',
                        symbol: '',
                        localizations: [],
                      });
                    }}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </div>
                    ) : (
                      <>
                        {isRTL ? 'إنشاء' : 'Create'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Currency Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedCurrency(null);
            editForm.reset({
              name: '',
              code: '',
              symbol: '',
              isActive: true,
              localizations: [],
            });
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير العملة' : 'Edit Currency'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات العملة وترجماتها' : 'Update the currency details and translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم العملة مطلوب' : 'Currency name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم العملة' : 'Currency Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="code"
                    rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency code is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Code'}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="symbol"
                    rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency symbol is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Symbol'}</FormLabel>
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'العملة نشطة' : 'Active Currency'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل العملة' : 'Enable or disable this currency'}
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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          rules={{ required: isRTL ? 'اسم العملة مطلوب' : 'Currency name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اسم العملة' : 'Currency Name'}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name={`localizations.${index}.code`}
                          rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency code is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Code'}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name={`localizations.${index}.symbol`}
                          rules={{ required: isRTL ? 'رمز العملة مطلوب' : 'Currency symbol is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رمز العملة' : 'Currency Symbol'}</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedCurrency(null);
                      editForm.reset({
                        name: '',
                        code: '',
                        symbol: '',
                        isActive: true,
                        localizations: [],
                      });
                    }}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                      </div>
                    ) : (
                      <>
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Currency Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل العملة' : 'Currency Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات العملة وترجماتها' : 'Comprehensive view of currency information and translations'}
              </DialogDescription>
            </DialogHeader>

            {selectedCurrencyForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم العملة' : 'Currency Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedCurrencyForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedCurrencyForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'رمز العملة' : 'Currency Code'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <Badge variant="secondary" className="font-mono">
                            {selectedCurrencyForDetails.code}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'رمز العملة' : 'Currency Symbol'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-lg font-semibold">{selectedCurrencyForDetails.symbol}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCurrencyForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCurrencyForDetails.updatedAt)}</span>
                        </div>
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
                        {selectedCurrencyForDetails.localizations.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCurrencyForDetails.localizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لهذه العملة' : 'No translations available for this currency'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCurrencyForDetails.localizations.map((localization, index) => (
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
                                        {localization.language?.name} ({localization.language?.code})
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'اسم العملة' : 'Currency Name'}
                                    </label>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <p className="text-sm leading-relaxed">
                                        {localization.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'رمز العملة' : 'Currency Code'}
                                    </label>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <Badge variant="secondary" className="font-mono text-xs">
                                        {localization.code}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'رمز العملة' : 'Currency Symbol'}
                                    </label>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <span className="text-lg font-semibold">
                                        {localization.symbol}
                                      </span>
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
                      {isRTL ? 'إحصائيات العملة' : 'Currency Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedCurrencyForDetails.localizations.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedCurrencyForDetails.name.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول الاسم' : 'Name Length'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {selectedCurrencyForDetails.code.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول الرمز' : 'Code Length'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedCurrencyForDetails.symbol.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول الرمز' : 'Symbol Length'}
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
                  setSelectedCurrencyForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedCurrencyForDetails) {
                    handleEdit(selectedCurrencyForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedCurrencyForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير العملة' : 'Edit Currency'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Missing Translations Modal */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && (
          <MissingCurrencyTranslationsModal
            isOpen={isMissingTranslationsModalOpen}
            onOpenChange={setIsMissingTranslationsModalOpen}
            missingCurrencyIds={missingTranslationsIds}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Currencies;
