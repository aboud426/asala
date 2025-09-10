import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  MapPin,
  Globe,
  Users,
  Copy,
  RotateCcw,
  Loader2,
  ArrowLeft,
  Trash2,
  Edit,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationService, {
  LocationDto,
  UpdateLocationDto,
  UpdateLocationLocalizedDto,
} from '@/services/locationService';
import regionService, { RegionDropdownDto } from '@/services/regionService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import customerAdminService, { CustomerDto } from '@/services/customerAdminService';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
    position: [number, number] | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

interface SearchResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    importance: number;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const EditLocation: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Get filter parameters from URL
  const userIdFilter = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : null;
  const regionIdFilter = searchParams.get('regionId') ? parseInt(searchParams.get('regionId')!) : null;

  // Map selector states
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: '', lng: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([24.7136, 46.6753]);
  const [mapZoom, setMapZoom] = useState(13);

  // Query for location data
  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocationById(parseInt(id!)),
    enabled: !!id,
  });

  // Form setup
  const editForm = useForm<UpdateLocationDto>({
    defaultValues: {
      name: '',
      regionId: 0,
      userId: 0,
      latitude: 0,
      longitude: 0,
      isActive: true,
      localizations: [],
    },
  });

  const {
    fields: editLocalizations,
    append: appendEditLocalization,
    remove: removeEditLocalization,
  } = useFieldArray({
    control: editForm.control,
    name: 'localizations',
  });

  // Update form when location data is loaded
  useEffect(() => {
    if (locationData) {
      editForm.reset({
        name: locationData.name,
        regionId: locationData.regionId,
        userId: locationData.userId,
        latitude: locationData.latitude || 0,
        longitude: locationData.longitude || 0,
        isActive: locationData.isActive,
        localizations: locationData.localizations.map(loc => ({
          id: loc.id,
          name: loc.name,
          languageId: loc.languageId,
          isActive: loc.isActive,
        })),
      });

      // Set map position if coordinates exist
      if (locationData.latitude && locationData.longitude) {
        const position: [number, number] = [locationData.latitude, locationData.longitude];
        setSelectedPosition(position);
        setMapCenter(position);
        setMapCoordinates({
          lat: locationData.latitude.toFixed(6),
          lng: locationData.longitude.toFixed(6),
        });
      }
    }
  }, [locationData, editForm]);

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

  // Map search functionality
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '5',
          countrycodes: 'sa,ae,kw,qa,bh,om,jo,eg,lb,sy,iq',
          addressdetails: '1'
        })
      );

      if (response.ok) {
        const data: SearchResult[] = await response.json();
        setSearchResults(data);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      toast.error(
        isRTL 
          ? 'فشل البحث عن الأماكن. يرجى المحاولة مرة أخرى.'
          : 'Failed to search for places. Please try again.'
      );
    } finally {
      setIsSearching(false);
    }
  }, [isRTL]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  // Map location selection handler
  const handleLocationSelect = (lat: number, lng: number) => {
    const position: [number, number] = [lat, lng];
    setSelectedPosition(position);
    setMapCoordinates({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    });
    
    // Update form values
    editForm.setValue('latitude', lat);
    editForm.setValue('longitude', lng);
    
    toast.success(
      isRTL 
        ? `تم تحديد الموقع - خط العرض: ${lat.toFixed(6)}, خط الطول: ${lng.toFixed(6)}`
        : `Location selected - Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
    );
  };

  // Search result selection handler
  const handleSearchResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const position: [number, number] = [lat, lng];
    
    setSelectedPosition(position);
    setMapCenter(position);
    setMapZoom(15);
    setMapCoordinates({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    });
    setSearchQuery(result.display_name);
    setSearchResults([]);
    
    // Update form values
    editForm.setValue('latitude', lat);
    editForm.setValue('longitude', lng);
    
    toast.success(
      isRTL ? 'تم اختيار المكان' : 'Place selected',
      { description: result.display_name }
    );
  };

  // Manual coordinate change handler
  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    setMapCoordinates(prev => ({
      ...prev,
      [field]: value
    }));

    const lat = field === 'lat' ? parseFloat(value) : parseFloat(mapCoordinates.lat);
    const lng = field === 'lng' ? parseFloat(value) : parseFloat(mapCoordinates.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedPosition([lat, lng]);
      editForm.setValue('latitude', lat);
      editForm.setValue('longitude', lng);
    }
  };

  // Copy coordinates to clipboard
  const copyCoordinates = () => {
    if (selectedPosition) {
      const coordText = `${mapCoordinates.lat}, ${mapCoordinates.lng}`;
      navigator.clipboard.writeText(coordText);
      toast.success(
        isRTL ? 'تم نسخ الإحداثيات إلى الحافظة' : 'Coordinates copied to clipboard'
      );
    }
  };

  // Reset map selection
  const resetMapSelection = () => {
    setSelectedPosition(null);
    setMapCoordinates({ lat: '', lng: '' });
    setSearchQuery('');
    setSearchResults([]);
    setMapCenter([24.7136, 46.6753]);
    setMapZoom(13);
    editForm.setValue('latitude', 0);
    editForm.setValue('longitude', 0);
    toast.success(
      isRTL ? 'تم مسح تحديد الموقع' : 'Location selection cleared'
    );
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationDto }) =>
      locationService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations-all'] });
      queryClient.invalidateQueries({ queryKey: ['location', id] });
      toast.success(isRTL ? 'تم تحديث الموقع بنجاح' : 'Location updated successfully');
      
      // Navigate back to locations page with preserved filters
      const params = new URLSearchParams();
      if (userIdFilter) params.set('userId', userIdFilter.toString());
      if (regionIdFilter) params.set('regionId', regionIdFilter.toString());
      const queryString = params.toString();
      navigate(`/locations${queryString ? `?${queryString}` : ''}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث الموقع' : 'Error updating location'));
    },
  });

  // Form submission handler
  const onEditSubmit = async (data: UpdateLocationDto) => {
    if (!id) return;
    updateMutation.mutate({ id: parseInt(id), data });
  };

  // Add new localization
  const addNewLocalization = () => {
    const newLocalization = {
      name: '',
      languageId: 0,
      isActive: true,
    };
    appendEditLocalization(newLocalization);
  };

  // Handle back navigation
  const handleBack = () => {
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter.toString());
    if (regionIdFilter) params.set('regionId', regionIdFilter.toString());
    const queryString = params.toString();
    navigate(`/locations${queryString ? `?${queryString}` : ''}`);
  };

  if (locationLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{isRTL ? 'جاري تحميل بيانات الموقع...' : 'Loading location data...'}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!locationData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              {isRTL ? 'الموقع غير موجود' : 'Location not found'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'لم يتم العثور على الموقع المطلوب' : 'The requested location could not be found'}
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isRTL ? 'العودة للمواقع' : 'Back to Locations'}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? 'العودة' : 'Back'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'تحرير الموقع' : 'Edit Location'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? `تحرير معلومات الموقع "${locationData.name}" وتحديد موقعه على الخريطة`
                : `Edit the details for "${locationData.name}" and update its position on the map`
              }
            </p>
            {(userIdFilter || regionIdFilter) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {userIdFilter && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                    <Users className="h-3 w-3 mr-1" />
                    {isRTL ? `مفلتر حسب العميل: #${userIdFilter}` : `Filtered by Customer: #${userIdFilter}`}
                  </Badge>
                )}
                {regionIdFilter && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    <MapPin className="h-3 w-3 mr-1" />
                    {isRTL ? `مفلتر حسب المنطقة: #${regionIdFilter}` : `Filtered by Region: #${regionIdFilter}`}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              {isRTL ? 'معلومات الموقع' : 'Location Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <FormField
                    control={editForm.control}
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
                </div>

                {/* Region and Customer Selection */}
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

                {/* Active Status */}
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

                {/* Map Selector Section */}
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {isRTL ? 'تحديد الموقع على الخريطة' : 'Location on Map'}
                    </h4>
                    {selectedPosition && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetMapSelection}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {isRTL ? 'إعادة تعيين' : 'Reset'}
                      </Button>
                    )}
                  </div>

                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'البحث عن مكان' : 'Search for a place'}
                    </label>
                    <div className="relative">
                      <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      {isSearching && (
                        <Loader2 className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground ${isRTL ? 'left-3' : 'right-3'}`} />
                      )}
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isRTL ? 'ابحث عن مكان...' : 'Search for a place...'}
                        className={isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                      />
                    </div>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded-lg bg-background">
                        {searchResults.map((result) => (
                          <div
                            key={result.place_id}
                            className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
                            onClick={() => handleSearchResultSelect(result)}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {result.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.display_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive Map */}
                  <div className="h-96 w-full rounded-lg overflow-hidden border">
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: '100%', width: '100%' }}
                      key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker
                        position={selectedPosition}
                        onLocationSelect={handleLocationSelect}
                      />
                    </MapContainer>
                  </div>

                  {/* Current Selection Display */}
                  {selectedPosition && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <h3 className="font-medium text-primary text-sm mb-2">
                        {isRTL ? 'الموقع المحدد' : 'Selected Location'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p><strong>{isRTL ? 'خط العرض:' : 'Latitude:'}</strong> {mapCoordinates.lat}</p>
                        <p><strong>{isRTL ? 'خط الطول:' : 'Longitude:'}</strong> {mapCoordinates.lng}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyCoordinates}
                        className="mt-2 w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {isRTL ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
                      </Button>
                    </div>
                  )}

                  {/* Manual Coordinate Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'خط العرض (Latitude)' : 'Latitude'}
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={mapCoordinates.lat}
                        onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                        placeholder={isRTL ? 'أدخل خط العرض' : 'Enter latitude'}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'خط الطول (Longitude)' : 'Longitude'}
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={mapCoordinates.lng}
                        onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                        placeholder={isRTL ? 'أدخل خط الطول' : 'Enter longitude'}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-3 rounded-lg bg-muted/30">
                    <h4 className="font-medium text-sm mb-2">
                      {isRTL ? 'كيفية الاستخدام:' : 'How to use:'}
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>
                        {isRTL 
                          ? '• ابحث عن مكان بالاسم في خانة البحث'
                          : '• Search for places by name in the search box'
                        }
                      </li>
                      <li>
                        {isRTL 
                          ? '• انقر في أي مكان على الخريطة لتحديد موقع'
                          : '• Click anywhere on the map to select a location'
                        }
                      </li>
                      <li>
                        {isRTL 
                          ? '• أو أدخل الإحداثيات يدوياً'
                          : '• Or enter coordinates manually'
                        }
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Localizations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{isRTL ? 'الترجمات' : 'Localizations'}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewLocalization}
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

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
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
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditLocation;
