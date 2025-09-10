import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MapPin,
  Globe,
  CheckCircle,
  Edit,
  ArrowLeft,
  Copy,
  Users,
  CalendarDays,
  Maximize,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationService, { LocationDto } from '@/services/locationService';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationDetails: React.FC = () => {
  const { isRTL } = useDirection();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  // Get filter parameters from URL to preserve them when navigating back
  const userIdFilter = searchParams.get('userId');
  const regionIdFilter = searchParams.get('regionId');

  // Query for location details
  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getLocationById(parseInt(id!)),
    enabled: !!id,
  });

  // Handle back navigation with preserved filters
  const handleBack = () => {
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter);
    if (regionIdFilter) params.set('regionId', regionIdFilter);
    const queryString = params.toString();
    navigate(`/locations${queryString ? `?${queryString}` : ''}`);
  };

  // Handle edit navigation
  const handleEdit = () => {
    if (!location) return;
    const params = new URLSearchParams();
    if (userIdFilter) params.set('userId', userIdFilter);
    if (regionIdFilter) params.set('regionId', regionIdFilter);
    const queryString = params.toString();
    navigate(`/locations/edit/${location.id}${queryString ? `?${queryString}` : ''}`);
  };

  // Get status badge
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !location) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              {isRTL ? 'العودة' : 'Back'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isRTL ? 'خطأ' : 'Error'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'لم يتم العثور على الموقع' : 'Location not found'}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              {isRTL ? 'العودة' : 'Back'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {location.name}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'تفاصيل الموقع' : 'Location Details'}
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
                </div>
              )}
            </div>
          </div>
          <Button className="gradient-primary" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {isRTL ? 'تحرير الموقع' : 'Edit Location'}
          </Button>
        </div>

        {/* Basic Information */}
        <Card className="border-0 shadow-elegant">
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
                  <span className="text-sm font-medium">{location.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'المنطقة' : 'Region'}
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{location.regionName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'اسم العميل' : 'Customer Name'}
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">{location.userName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'الحالة' : 'Status'}
                </label>
                <div className="p-3">
                  {getStatusBadge(location.isActive)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                </label>
                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(location.createdAt)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                </label>
                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(location.updatedAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Location */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {isRTL ? 'موقع الخريطة' : 'Map Location'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location.latitude === 0 && location.longitude === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لم يتم تحديد موقع على الخريطة' : 'No map location set for this location'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Coordinates Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {isRTL ? 'خط العرض' : 'Latitude'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{location.latitude.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {isRTL ? 'خط الطول' : 'Longitude'}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{location.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="h-80 w-full rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    dragging={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.latitude, location.longitude]} />
                  </MapContainer>
                </div>

                {/* Map Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMapDialogOpen(true)}
                    className="flex-1"
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    {isRTL ? 'عرض بملء الشاشة' : 'Full Screen'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const coordText = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
                      navigator.clipboard.writeText(coordText);
                      toast.success(
                        isRTL ? 'تم نسخ الإحداثيات إلى الحافظة' : 'Coordinates copied to clipboard'
                      );
                    }}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {isRTL ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="flex-1"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {isRTL ? 'فتح في Google Maps' : 'Open in Google Maps'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Localizations */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {isRTL ? 'الترجمات' : 'Localizations'}
              <Badge variant="secondary" className="ml-2">
                {location.localizations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location.localizations.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد ترجمات متاحة لهذا الموقع' : 'No translations available for this location'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {location.localizations.map((localization, index) => (
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
        <Card className="border-0 shadow-elegant">
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
                  {location.localizations.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {location.localizations.filter(l => l.isActive).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {location.localizations.filter(l => !l.isActive).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'ترجمات غير نشطة' : 'Inactive Translations'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {location.name.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'طول الاسم' : 'Name Length'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Screen Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {isRTL ? 'موقع الخريطة - عرض بملء الشاشة' : 'Map Location - Full Screen View'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 pt-0">
            <div className="h-[calc(95vh-120px)] w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                dragging={true}
                zoomControl={true}
                key={isMapDialogOpen ? 'fullscreen-map' : 'closed'}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.latitude, location.longitude]} />
              </MapContainer>
            </div>
            
            {/* Full Screen Map Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const coordText = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
                  navigator.clipboard.writeText(coordText);
                  toast.success(
                    isRTL ? 'تم نسخ الإحداثيات إلى الحافظة' : 'Coordinates copied to clipboard'
                  );
                }}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isRTL ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                  window.open(url, '_blank');
                }}
                className="flex-1"
              >
                <Globe className="h-4 w-4 mr-2" />
                {isRTL ? 'فتح في Google Maps' : 'Open in Google Maps'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LocationDetails;
