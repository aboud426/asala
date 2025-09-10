import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  MapPin,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Eye,
  Users,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationService, {
  LocationDto,
  CreateLocationDto,
  UpdateLocationDto,
  CreateLocationLocalizedDto,
  UpdateLocationLocalizedDto,
  PaginatedResult
} from '@/services/locationService';
import regionService, { RegionDropdownDto } from '@/services/regionService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import customerAdminService, { CustomerDto } from '@/services/customerAdminService';

const Locations: React.FC = () => {
  const { isRTL } = useDirection();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | string>('all');
  const [userIdFilter, setUserIdFilter] = useState<number | null>(null);
  const [regionIdFilter, setRegionIdFilter] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDto | null>(null);
  const [selectedLocationForDetails, setSelectedLocationForDetails] = useState<LocationDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Initialize filters from query parameters
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    const regionIdParam = searchParams.get('regionId');
    
    console.log('URL parameters - userId:', userIdParam, 'regionId:', regionIdParam);
    
    // Handle userId parameter
    if (userIdParam) {
      const parsedUserId = parseInt(userIdParam);
      if (!isNaN(parsedUserId)) {
        console.log('Setting userIdFilter to:', parsedUserId);
        setUserIdFilter(parsedUserId);
      } else {
        console.log('Invalid userId parameter');
        setUserIdFilter(null);
      }
    } else {
      console.log('No userId parameter found');
      setUserIdFilter(null);
    }

    // Handle regionId parameter
    if (regionIdParam) {
      const parsedRegionId = parseInt(regionIdParam);
      if (!isNaN(parsedRegionId)) {
        console.log('Setting regionIdFilter to:', parsedRegionId);
        setRegionIdFilter(parsedRegionId);
      } else {
        console.log('Invalid regionId parameter');
        setRegionIdFilter(null);
      }
    } else {
      console.log('No regionId parameter found');
      setRegionIdFilter(null);
    }
  }, [searchParams]);

  // Form setup
  const createForm = useForm<CreateLocationDto>({
    defaultValues: {
      name: '',
      description: '',
      regionId: regionIdFilter || 0,
      userId: userIdFilter || 0,
      isActive: true,
      localizations: [],
    },
  });

  // Update create form when filters change
  useEffect(() => {
    if (userIdFilter) {
      createForm.setValue('userId', userIdFilter);
    }
    if (regionIdFilter) {
      createForm.setValue('regionId', regionIdFilter);
    }
  }, [userIdFilter, regionIdFilter, createForm]);

  const editForm = useForm<UpdateLocationDto>({
    defaultValues: {
      name: '',
      description: '',
      regionId: 0,
      userId: 0,
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

  // Query for locations data
  const { data: locationsData, isLoading, error } = useQuery({
    queryKey: ['locations', currentPage, pageSize, statusFilter, userIdFilter, regionIdFilter],
    queryFn: () => {
      const params: {
        page: number;
        pageSize: number;
        isActive?: boolean;
        userId?: number;
        regionId?: number;
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
      
      // Add userId filter if it exists
      if (userIdFilter !== null) {
        params.userId = userIdFilter;
      }

      // Add regionId filter if it exists
      if (regionIdFilter !== null) {
        params.regionId = regionIdFilter;
      }
      
      return locationService.getLocations(params);
    },
  });

  // Query for all locations to calculate stats
  const { data: allLocationsData } = useQuery({
    queryKey: ['locations-all'],
    queryFn: () => locationService.getLocations({ pageSize: 1000 }),
  });

  // Query for regions dropdown
  const { data: regionsData } = useQuery({
    queryKey: ['regions-dropdown'],
    queryFn: () => regionService.getRegionsDropdown(),
  });

  // Query for languages dropdown
  const { data: languagesData } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for customers dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers-dropdown'],
    queryFn: () => customerAdminService.getCustomers({ pageSize: 1000 }),
  });

  // Query for locations missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['locations-missing-translations'],
    queryFn: () => locationService.getLocationsMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: locationService.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      toast.success(isRTL ? 'تم إنشاء الموقع بنجاح' : 'Location created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء الموقع' : 'Error creating location'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationDto }) => 
      locationService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      toast.success(isRTL ? 'تم تحديث الموقع بنجاح' : 'Location updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث الموقع' : 'Error updating location'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: locationService.toggleLocationActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      toast.success(isRTL ? 'تم تحديث حالة الموقع' : 'Location status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة الموقع' : 'Error updating location status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: locationService.deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      toast.success(isRTL ? 'تم حذف الموقع بنجاح' : 'Location deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف الموقع' : 'Error deleting location'));
    },
  });

  // Filter locations client-side for search and region
  const filteredLocations = locationsData?.items.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.localizations.some(loc => 
                           loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loc.description.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesRegion = regionFilter === 'all' || location.regionId.toString() === regionFilter;
    
    return matchesSearch && matchesRegion;
  }) || [];

  // Stats
  const stats = {
    total: allLocationsData?.totalCount || 0,
    active: allLocationsData?.items.filter(l => l.isActive).length || 0,
    inactive: allLocationsData?.items.filter(l => !l.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateLocationDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateLocationDto) => {
    if (!selectedLocation) return;
    updateMutation.mutate({ id: selectedLocation.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedLocation(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (location: LocationDto) => {
    setSelectedLocation(location);
    editForm.reset({
      name: location.name,
      description: location.description,
      regionId: location.regionId,
      userId: location.userId,
      isActive: location.isActive,
      localizations: location.localizations.map(loc => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (location: LocationDto) => {
    setSelectedLocationForDetails(location);
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

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة المواقع' : 'Locations Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة المواقع وترجماتها' : 'Manage locations and their translations'}
            </p>
            {(userIdFilter || regionIdFilter) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {userIdFilter && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                    <Users className="h-3 w-3 mr-1" />
                    {isRTL ? `مفلتر حسب العميل: #${userIdFilter}` : `Filtered by Customer ID: #${userIdFilter}`}
                  </Badge>
                )}
                {regionIdFilter && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    <MapPin className="h-3 w-3 mr-1" />
                    {isRTL ? `مفلتر حسب المنطقة: #${regionIdFilter}` : `Filtered by Region ID: #${regionIdFilter}`}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUserIdFilter(null);
                    setRegionIdFilter(null);
                    // Update the URL to remove both parameters
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('userId');
                    newSearchParams.delete('regionId');
                    window.history.replaceState(null, '', `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  {isRTL ? 'إزالة الفلاتر' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </div>
          <Button 
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة موقع جديد' : 'Add New Location'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي المواقع' : 'Total Locations'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'المواقع النشطة' : 'Active Locations'}
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
                    {isRTL ? 'المواقع غير النشطة' : 'Inactive Locations'}
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
                  placeholder={isRTL ? 'البحث في المواقع...' : 'Search locations...'}
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    >
                      <MapPin className="h-4 w-4" />
                      {regionFilter === 'all' ? 
                        (isRTL ? 'جميع المناطق' : 'All Regions') : 
                        regionsData?.find(r => r.id.toString() === regionFilter)?.name || 'Region'
                      }
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setRegionFilter('all')}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      {isRTL ? 'جميع المناطق' : 'All Regions'}
                    </DropdownMenuItem>
                    {regionsData?.map((region) => (
                      <DropdownMenuItem 
                        key={region.id}
                        onClick={() => setRegionFilter(region.id.toString())}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {region.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredLocations.length} موقع` : `${filteredLocations.length} Locations`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table dir={isRTL ? 'rtl' : 'ltr'} className={`${isRTL ? 'text-right' : 'text-left'} min-w-full`}>
                <TableHeader>
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableHead className={`text-start min-w-[200px]`}>
                      {isRTL ? 'اسم الموقع' : 'Location Name'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[150px]`}>
                      {isRTL ? 'المنطقة' : 'Region'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[150px]`}>
                      {isRTL ? 'العميل' : 'Customer'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[100px]`}>
                      {isRTL ? 'الترجمات' : 'Translations'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[100px]`}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[150px]`}>
                      {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                    </TableHead>
                    <TableHead className="text-center min-w-[80px]">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
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
                  ) : filteredLocations.length === 0 ? (
                    <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <MapPin className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {isRTL ? 'لا توجد مواقع متاحة' : 'No locations available'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLocations.map((location) => (
                      <TableRow key={location.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{truncateText(location.name, 25)}</p>
                              <p className="text-xs text-muted-foreground">ID: #{location.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="text-sm">
                            {location.regionName}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span className="text-sm">{location.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                            {location.localizations.map((loc) => (
                              <Badge key={loc.id} variant="outline" className="text-xs">
                                <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {loc.languageCode}
                              </Badge>
                            ))}
                            {location.localizations.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(location.isActive)}</TableCell>
                        <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                          {formatDate(location.createdAt)}
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
                                onClick={() => handleShowDetails(location)}
                              >
                                <Eye className="h-4 w-4" />
                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleEdit(location)}
                              >
                                <Edit className="h-4 w-4" />
                                {isRTL ? 'تحرير' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => toggleMutation.mutate(location.id)}
                              >
                                <Power className="h-4 w-4" />
                                {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => deleteMutation.mutate(location.id)}
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
            </div>

            {/* Pagination */}
            {locationsData && locationsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `عرض ${((locationsData.page - 1) * locationsData.pageSize) + 1} إلى ${Math.min(locationsData.page * locationsData.pageSize, locationsData.totalCount)} من ${locationsData.totalCount}`
                    : `Showing ${((locationsData.page - 1) * locationsData.pageSize) + 1} to ${Math.min(locationsData.page * locationsData.pageSize, locationsData.totalCount)} of ${locationsData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!locationsData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${locationsData.page} من ${locationsData.totalPages}` : `${locationsData.page} of ${locationsData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!locationsData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Location Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة موقع جديد' : 'Add New Location'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات الموقع الجديد وترجماته' : 'Enter the details for the new location and its translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم الموقع مطلوب' : 'Location name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الموقع' : 'Location Name'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isRTL ? 'مثال: المكتب الرئيسي، المتجر الفرعي' : 'e.g., Main Office, Branch Store'} 
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
                          placeholder={isRTL ? 'وصف الموقع' : 'Location description'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={`grid grid-cols-1 ${!userIdFilter && !regionIdFilter ? 'md:grid-cols-2' : (!userIdFilter || !regionIdFilter) ? 'md:grid-cols-2' : ''} gap-4`}>
                  {!regionIdFilter && (
                    <FormField
                      control={createForm.control}
                      name="regionId"
                      rules={{ required: isRTL ? 'المنطقة مطلوبة' : 'Region is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'المنطقة' : 'Region'}</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select Region'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regionsData?.map((region) => (
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
                  )}
                  {regionIdFilter && (
                    <div className="space-y-2">
                      <FormLabel>{isRTL ? 'المنطقة المحددة' : 'Selected Region'}</FormLabel>
                      <div className="p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {regionsData?.find(r => r.id === regionIdFilter)?.fullPath || `Region ID: ${regionIdFilter}`}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {isRTL ? 'محدد تلقائياً' : 'Auto-selected'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  {!userIdFilter && (
                    <FormField
                      control={createForm.control}
                      name="userId"
                      rules={{ required: isRTL ? 'العميل مطلوب' : 'Customer is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isRTL ? 'العميل' : 'Customer'}</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isRTL ? 'اختر العميل' : 'Select Customer'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customersData?.items.map((customer) => (
                                <SelectItem key={customer.userId} value={customer.userId.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {customer.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {userIdFilter && (
                    <div className="space-y-2">
                      <FormLabel>{isRTL ? 'العميل المحدد' : 'Selected Customer'}</FormLabel>
                      <div className="p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {customersData?.items.find(c => c.userId === userIdFilter)?.name || `Customer ID: ${userIdFilter}`}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {isRTL ? 'محدد تلقائياً' : 'Auto-selected'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'الموقع نشط' : 'Active Location'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الموقع' : 'Enable or disable this location'}
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
                  <Button type="submit" className="gradient-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </div>
                    ) : (
                      isRTL ? 'إنشاء' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Location Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير الموقع' : 'Edit Location'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات الموقع وترجماته' : 'Update the location details and translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم الموقع مطلوب' : 'Location name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الموقع' : 'Location Name'}</FormLabel>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="regionId"
                    rules={{ required: isRTL ? 'المنطقة مطلوبة' : 'Region is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'المنطقة' : 'Region'}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select Region'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regionsData?.map((region) => (
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
                    name="userId"
                    rules={{ required: isRTL ? 'العميل مطلوب' : 'Customer is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'العميل' : 'Customer'}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isRTL ? 'اختر العميل' : 'Select Customer'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customersData?.items.map((customer) => (
                              <SelectItem key={customer.userId} value={customer.userId.toString()}>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {customer.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          {isRTL ? 'الموقع نشط' : 'Active Location'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الموقع' : 'Enable or disable this location'}
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
                  <Button type="submit" className="gradient-primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        {isRTL ? 'جاري التحديث...' : 'Updating...'}
                      </div>
                    ) : (
                      isRTL ? 'حفظ التغييرات' : 'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Location Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل الموقع' : 'Location Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات الموقع وترجماته' : 'Comprehensive view of location information and translations'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedLocationForDetails && (
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
                          {isRTL ? 'اسم الموقع' : 'Location Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedLocationForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'المنطقة' : 'Region'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedLocationForDetails.regionName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم العميل' : 'Customer Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{selectedLocationForDetails.userName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedLocationForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedLocationForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedLocationForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'الوصف' : 'Description'}
                      </label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {selectedLocationForDetails.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
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
                        {selectedLocationForDetails.localizations.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLocationForDetails.localizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لهذا الموقع' : 'No translations available for this location'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedLocationForDetails.localizations.map((localization, index) => (
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
                      {isRTL ? 'إحصائيات الموقع' : 'Location Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedLocationForDetails.localizations.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                          {selectedLocationForDetails.localizations.filter(l => l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {selectedLocationForDetails.localizations.filter(l => !l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات غير نشطة' : 'Inactive Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedLocationForDetails.name.length}
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
                  setSelectedLocationForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedLocationForDetails) {
                    handleEdit(selectedLocationForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedLocationForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير الموقع' : 'Edit Location'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Locations;
