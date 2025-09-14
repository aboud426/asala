import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationService, {
  LocationDto,
  PaginatedResult
} from '@/services/locationService';
import regionService, { RegionDropdownDto } from '@/services/regionService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import customerAdminService, { CustomerDto } from '@/services/customerAdminService';

const Locations: React.FC = () => {
  const { isRTL } = useDirection();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | string>('all');
  const [userIdFilter, setUserIdFilter] = useState<number | null>(null);
  const [regionIdFilter, setRegionIdFilter] = useState<number | null>(null);
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
      location.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.localizations.some(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Handle navigate to create location page
  const handleNavigateToCreate = () => {
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter.toString());
    if (regionIdFilter) params.set('regionId', regionIdFilter.toString());
    const queryString = params.toString();
    navigate(`/locations/create${queryString ? `?${queryString}` : ''}`);
  };


  const handleEdit = (location: LocationDto) => {
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter.toString());
    if (regionIdFilter) params.set('regionId', regionIdFilter.toString());
    const queryString = params.toString();
    navigate(`/locations/edit/${location.id}${queryString ? `?${queryString}` : ''}`);
  };

  const handleShowDetails = (location: LocationDto) => {
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter.toString());
    if (regionIdFilter) params.set('regionId', regionIdFilter.toString());
    const queryString = params.toString();
    navigate(`/locations/${location.id}${queryString ? `?${queryString}` : ''}`);
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
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/40">
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
            onClick={handleNavigateToCreate}
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
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{truncateText(location.name, 25)}</p>
                                {location.latitude !== 0 && location.longitude !== 0 && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {isRTL ? 'خريطة' : 'Map'}
                                  </Badge>
                                )}
                              </div>
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
                              {location.latitude !== 0 && location.longitude !== 0 && (
                                <DropdownMenuItem
                                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                  onClick={() => {
                                    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  <MapPin className="h-4 w-4" />
                                  {isRTL ? 'عرض على الخريطة' : 'View on Map'}
                                </DropdownMenuItem>
                              )}
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


      </div>
    </DashboardLayout>
  );
};

export default Locations;
