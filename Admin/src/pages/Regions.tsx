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
  MapPin,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Eye,
  Map,
  Navigation,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import regionService, {
  RegionDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateLocalizedRegionDto,
  UpdateLocalizedRegionDto,
  PaginatedResult
} from '@/services/regionService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import MissingRegionTranslationsWarning from '@/components/ui/missing-region-translations-warning';
import MissingRegionTranslationsModal from '@/components/ui/missing-region-translations-modal';

const Regions: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionDto | null>(null);
  const [selectedRegionForDetails, setSelectedRegionForDetails] = useState<RegionDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isMissingTranslationsModalOpen, setIsMissingTranslationsModalOpen] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Form setup
  const createForm = useForm<CreateRegionDto>({
    defaultValues: {
      name: '',
      parentId: undefined,
      isActive: true,
      localizations: [],
    },
  });

  const editForm = useForm<UpdateRegionDto>({
    defaultValues: {
      name: '',
      parentId: undefined,
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

  // Query for regions data
  const { data: regionsData, isLoading, error } = useQuery({
    queryKey: ['regions', currentPage, pageSize, statusFilter],
    queryFn: () => {
      const params: {
        page: number;
        pageSize: number;
        isActive?: boolean;
      } = {
        page: currentPage,
        pageSize,
      };

      // Only add isActive filter if not showing 'all'
      if (statusFilter === 'active') {
        params.isActive = true;
      } else if (statusFilter === 'inactive') {
        params.isActive = false;
      }

      return regionService.getRegions(params);
    },
  });

  // Query for all regions to calculate stats
  const { data: allRegionsData } = useQuery({
    queryKey: ['regions-all'],
    queryFn: () => regionService.getRegions({ pageSize: 1000 }),
  });

  // Query for regions dropdown (for parent selection)
  const { data: regionsDropdownData } = useQuery({
    queryKey: ['regions-dropdown'],
    queryFn: () => regionService.getRegionsDropdown({ isActive: true }),
  });

  // Query for languages dropdown
  const { data: languagesData } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for regions missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['regions-missing-translations'],
    queryFn: () => regionService.getRegionsMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: regionService.createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-all'] });
      queryClient.invalidateQueries({ queryKey: ['regions-dropdown'] });
      toast.success(isRTL ? 'تم إنشاء المنطقة بنجاح' : 'Region created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء المنطقة' : 'Error creating region'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRegionDto }) =>
      regionService.updateRegion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-all'] });
      queryClient.invalidateQueries({ queryKey: ['regions-dropdown'] });
      toast.success(isRTL ? 'تم تحديث المنطقة بنجاح' : 'Region updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث المنطقة' : 'Error updating region'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: regionService.toggleRegionActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-all'] });
      toast.success(isRTL ? 'تم تحديث حالة المنطقة' : 'Region status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة المنطقة' : 'Error updating region status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: regionService.deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-all'] });
      queryClient.invalidateQueries({ queryKey: ['regions-dropdown'] });
      toast.success(isRTL ? 'تم حذف المنطقة بنجاح' : 'Region deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف المنطقة' : 'Error deleting region'));
    },
  });

  // Filter regions client-side for search
  const filteredRegions = regionsData?.items.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (region.parentName && region.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      region.localizations.some(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.languageName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allRegionsData?.totalCount || 0,
    active: allRegionsData?.items.filter(r => r.isActive).length || 0,
    inactive: allRegionsData?.items.filter(r => !r.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateRegionDto) => {
    // Prepare localizations data
    const formattedData = {
      ...data,
      localizations: data.localizations.map(loc => ({
        name: loc.name,
        languageId: loc.languageId,
        isActive: loc.isActive ?? true,
      })),
    };

    createMutation.mutate(formattedData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateRegionDto) => {
    if (!selectedRegion) return;
    updateMutation.mutate({ id: selectedRegion.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedRegion(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (region: RegionDto) => {
    setSelectedRegion(region);
    editForm.reset({
      name: region.name,
      parentId: region.parentId,
      isActive: region.isActive,
      localizations: region.localizations.map(loc => ({
        id: loc.id,
        name: loc.name,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (region: RegionDto) => {
    setSelectedRegionForDetails(region);
    setIsDetailsDialogOpen(true);
  };

  const handleViewLocations = (region: RegionDto) => {
    navigate(`/locations?regionId=${region.id}`);
  };

  const addNewLocalization = (isEdit: boolean = false) => {
    const newLocalization = {
      name: '',
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

  const renderRegionHierarchy = (region: RegionDto) => {
    return (
      <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{region.name}</p>
            {region.children && region.children.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {region.children.length} {isRTL ? 'فرع' : 'sub-regions'}
              </Badge>
            )}
          </div>
          {region.parentName && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {isRTL ? `تابع لـ: ${region.parentName}` : `Under: ${region.parentName}`}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة المناطق' : 'Regions Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة المناطق وترجماتها' : 'Manage regions and their translations'}
            </p>
          </div>
          <Button
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة منطقة جديدة' : 'Add New Region'}
          </Button>
        </div>

        {/* Missing Translations Warning */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && !dismissedWarning && (
          <MissingRegionTranslationsWarning
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
                    {isRTL ? 'إجمالي المناطق' : 'Total Regions'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Map className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'المناطق النشطة' : 'Active Regions'}
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
                    {isRTL ? 'المناطق غير النشطة' : 'Inactive Regions'}
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
                  placeholder={isRTL ? 'البحث في المناطق...' : 'Search regions...'}
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

        {/* Regions Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredRegions.length} منطقة` : `${filteredRegions.length} Regions`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'اسم المنطقة' : 'Region Name'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'المنطقة الأساسية' : 'Parent Region'}</TableHead>
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
                ) : filteredRegions.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد مناطق متاحة' : 'No regions available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegions.map((region) => (
                    <TableRow key={region.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {renderRegionHierarchy(region)}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {region.parentName ? (
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{region.parentName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {isRTL ? 'منطقة رئيسية' : 'Root region'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                          {region.localizations.map((loc) => (
                            <Badge key={loc.id} variant="outline" className="text-xs">
                              <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {loc.languageCode}
                            </Badge>
                          ))}
                          {region.localizations.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(region.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(region.createdAt)}
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
                              onClick={() => handleShowDetails(region)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleViewLocations(region)}
                            >
                              <MapPin className="h-4 w-4" />
                              {isRTL ? 'عرض المواقع' : 'View Locations'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(region)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => toggleMutation.mutate(region.id)}
                            >
                              <Power className="h-4 w-4" />
                              {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(region.id)}
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
            {regionsData && regionsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${((regionsData.page - 1) * regionsData.pageSize) + 1} إلى ${Math.min(regionsData.page * regionsData.pageSize, regionsData.totalCount)} من ${regionsData.totalCount}`
                    : `Showing ${((regionsData.page - 1) * regionsData.pageSize) + 1} to ${Math.min(regionsData.page * regionsData.pageSize, regionsData.totalCount)} of ${regionsData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!regionsData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${regionsData.page} من ${regionsData.totalPages}` : `${regionsData.page} of ${regionsData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!regionsData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Region Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة منطقة جديدة' : 'Add New Region'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات المنطقة الجديدة وترجماتها' : 'Enter the details for the new region and its translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم المنطقة مطلوب' : 'Region name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم المنطقة' : 'Region Name'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isRTL ? 'مثال: الرياض، جدة، دبي' : 'e.g., Riyadh, Jeddah, Dubai'}
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
                      <FormLabel>{isRTL ? 'المنطقة الأساسية' : 'Parent Region'}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : parseInt(value))} value={field.value?.toString() || 'none'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر المنطقة الأساسية (اختياري)' : 'Select Parent Region (Optional)'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">
                              {isRTL ? 'لا يوجد (منطقة رئيسية)' : 'None (Root Region)'}
                            </span>
                          </SelectItem>
                          {regionsDropdownData?.map((region) => (
                            <SelectItem key={region.id} value={region.id.toString()}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {region.fullPath}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'المنطقة نشطة' : 'Active Region'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل المنطقة' : 'Enable or disable this region'}
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

        {/* Edit Region Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير المنطقة' : 'Edit Region'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات المنطقة وترجماتها' : 'Update the region details and translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم المنطقة مطلوب' : 'Region name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم المنطقة' : 'Region Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>{isRTL ? 'المنطقة الأساسية' : 'Parent Region'}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'none' ? undefined : parseInt(value))} value={field.value?.toString() || 'none'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر المنطقة الأساسية (اختياري)' : 'Select Parent Region (Optional)'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">
                              {isRTL ? 'لا يوجد (منطقة رئيسية)' : 'None (Root Region)'}
                            </span>
                          </SelectItem>
                          {regionsDropdownData?.filter(r => r.id !== selectedRegion?.id).map((region) => (
                            <SelectItem key={region.id} value={region.id.toString()}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {region.fullPath}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'المنطقة نشطة' : 'Active Region'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل المنطقة' : 'Enable or disable this region'}
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

        {/* Region Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل المنطقة' : 'Region Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات المنطقة وترجماتها' : 'Comprehensive view of region information and translations'}
              </DialogDescription>
            </DialogHeader>

            {selectedRegionForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم المنطقة' : 'Region Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedRegionForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedRegionForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'المنطقة الأساسية' : 'Parent Region'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">
                            {selectedRegionForDetails.parentName || (isRTL ? 'منطقة رئيسية' : 'Root region')}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'المناطق الفرعية' : 'Sub-regions'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{selectedRegionForDetails.children.length}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedRegionForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedRegionForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-regions */}
                {selectedRegionForDetails.children.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        {isRTL ? 'المناطق الفرعية' : 'Sub-regions'}
                        <Badge variant="secondary" className="ml-2">
                          {selectedRegionForDetails.children.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedRegionForDetails.children.map((child) => (
                          <div key={child.id} className="p-3 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{child.name}</span>
                              {getStatusBadge(child.isActive)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Localizations */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {isRTL ? 'الترجمات' : 'Localizations'}
                      <Badge variant="secondary" className="ml-2">
                        {selectedRegionForDetails.localizations.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRegionForDetails.localizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لهذه المنطقة' : 'No translations available for this region'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedRegionForDetails.localizations.map((localization, index) => (
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
                                      {isRTL ? 'معرف اللغة' : 'Language ID'}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {localization.languageId}
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
                      {isRTL ? 'إحصائيات المنطقة' : 'Region Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedRegionForDetails.localizations.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                          {selectedRegionForDetails.localizations.filter(l => l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedRegionForDetails.children.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'مناطق فرعية' : 'Sub-regions'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {selectedRegionForDetails.name.length}
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
                  setSelectedRegionForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedRegionForDetails) {
                    handleEdit(selectedRegionForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedRegionForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير المنطقة' : 'Edit Region'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Missing Translations Modal */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && (
          <MissingRegionTranslationsModal
            isOpen={isMissingTranslationsModalOpen}
            onOpenChange={setIsMissingTranslationsModalOpen}
            missingRegionIds={missingTranslationsIds}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Regions;
