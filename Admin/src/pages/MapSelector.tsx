import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Copy, RotateCcw, Search, Loader2 } from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const MapSelector: React.FC = () => {
    const { isRTL } = useDirection();
    const { toast } = useToast();
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
    const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([24.7136, 46.6753]);
    const [mapZoom, setMapZoom] = useState(13);

    // Default map center (Riyadh, Saudi Arabia)
    const defaultCenter: [number, number] = [24.7136, 46.6753];

  // Debounced search function
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
          countrycodes: 'sa,ae,kw,qa,bh,om,jo,eg,lb,sy,iq', // Middle East countries
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
      toast({
        title: isRTL ? "خطأ في البحث" : "Search Error",
        description: isRTL 
          ? "فشل البحث عن الأماكن. يرجى المحاولة مرة أخرى."
          : "Failed to search for places. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [isRTL, toast]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  const handleLocationSelect = (lat: number, lng: number) => {
    const position: [number, number] = [lat, lng];
    setSelectedPosition(position);
    setCoordinates({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    });
    
    toast({
      title: isRTL ? "تم تحديد الموقع" : "Location Selected",
      description: isRTL 
        ? `خط العرض: ${lat.toFixed(6)}, خط الطول: ${lng.toFixed(6)}`
        : `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
    });
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const position: [number, number] = [lat, lng];
    
    setSelectedPosition(position);
    setMapCenter(position);
    setMapZoom(15);
    setCoordinates({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    });
    setSearchQuery(result.display_name);
    setSearchResults([]);
    
    toast({
      title: isRTL ? "تم اختيار المكان" : "Place Selected",
      description: result.display_name,
    });
  };

    const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
        setCoordinates(prev => ({
            ...prev,
            [field]: value
        }));

        // Update marker position if both coordinates are valid
        const lat = field === 'lat' ? parseFloat(value) : parseFloat(coordinates.lat);
        const lng = field === 'lng' ? parseFloat(value) : parseFloat(coordinates.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            setSelectedPosition([lat, lng]);
        }
    };

    const copyCoordinates = () => {
        if (selectedPosition) {
            const coordText = `${coordinates.lat}, ${coordinates.lng}`;
            navigator.clipboard.writeText(coordText);
            toast({
                title: isRTL ? "تم النسخ" : "Copied",
                description: isRTL
                    ? "تم نسخ الإحداثيات إلى الحافظة"
                    : "Coordinates copied to clipboard",
            });
        }
    };

  const resetMap = () => {
    setSelectedPosition(null);
    setCoordinates({ lat: '', lng: '' });
    setSearchQuery('');
    setSearchResults([]);
    setMapCenter(defaultCenter);
    setMapZoom(13);
    toast({
      title: isRTL ? "تم إعادة التعيين" : "Reset",
      description: isRTL 
        ? "تم مسح التحديد"
        : "Selection cleared",
    });
  };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {isRTL ? 'محدد المواقع' : 'Location Selector'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRTL
                            ? 'انقر على الخريطة لتحديد موقع والحصول على الإحداثيات'
                            : 'Click on the map to select a location and get coordinates'
                        }
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Map Card */}
                    <Card className="border-0 shadow-elegant lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {isRTL ? 'الخريطة التفاعلية' : 'Interactive Map'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
              <div className="h-[500px] w-full relative rounded-b-lg overflow-hidden">
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
                        </CardContent>
                    </Card>

                    {/* Coordinates Panel */}
                    <Card className="border-0 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {isRTL ? 'الإحداثيات' : 'Coordinates'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="place-search">
                  {isRTL ? 'البحث عن مكان' : 'Search for a place'}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Input
                    id="place-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? 'ابحث عن مكان...' : 'Search for a place...'}
                    className="pl-10 pr-10"
                  />
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg bg-background">
                    {searchResults.map((result) => (
                      <div
                        key={result.place_id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
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

              <Separator />
                            {/* Current Selection */}
                            {selectedPosition && (
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <h3 className="font-medium text-primary mb-2">
                                        {isRTL ? 'الموقع المحدد' : 'Selected Location'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>{isRTL ? 'خط العرض:' : 'Latitude:'}</strong> {coordinates.lat}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>{isRTL ? 'خط الطول:' : 'Longitude:'}</strong> {coordinates.lng}
                                    </p>
                                </div>
                            )}

                            {/* Manual Coordinate Input */}
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="latitude">
                                        {isRTL ? 'خط العرض (Latitude)' : 'Latitude'}
                                    </Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={coordinates.lat}
                                        onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                                        placeholder={isRTL ? 'أدخل خط العرض' : 'Enter latitude'}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="longitude">
                                        {isRTL ? 'خط الطول (Longitude)' : 'Longitude'}
                                    </Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={coordinates.lng}
                                        onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                                        placeholder={isRTL ? 'أدخل خط الطول' : 'Enter longitude'}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    onClick={copyCoordinates}
                                    disabled={!selectedPosition}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {isRTL ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
                                </Button>

                                <Button
                                    onClick={resetMap}
                                    disabled={!selectedPosition}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إعادة تعيين' : 'Reset'}
                                </Button>
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
                  <li>
                    {isRTL 
                      ? '• استخدم زر النسخ لنسخ الإحداثيات'
                      : '• Use copy button to copy coordinates'
                    }
                  </li>
                </ul>
              </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MapSelector;
