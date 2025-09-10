// Location API Service
// Based on the LocationController.cs endpoints

export interface LocationLocalizedDto {
    id: number;
    name: string;
    description: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LocationDto {
    id: number;
    name: string;
    description: string;
    regionId: number;
    regionName: string;
    userId: number;
    userName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: LocationLocalizedDto[];
}

export interface CreateLocationLocalizedDto {
    name: string;
    description: string;
    languageId: number;
    isActive?: boolean;
}

export interface CreateLocationDto {
    name: string;
    description: string;
    regionId: number;
    userId: number;
    isActive?: boolean;
    localizations: CreateLocationLocalizedDto[];
}

export interface UpdateLocationLocalizedDto {
    id?: number; // Optional (null for new translations)
    name: string;
    description: string;
    languageId: number;
    isActive: boolean;
}

export interface UpdateLocationDto {
    name: string;
    description: string;
    regionId: number;
    userId: number;
    isActive: boolean;
    localizations: UpdateLocationLocalizedDto[];
}

export interface LocationDropdownDto {
    id: number;
    name: string;
    description: string;
    regionName: string;
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    messageCode: string;
    data?: T;
}

class LocationService {
    private readonly baseUrl = '/api/location';

    private request = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);
            
            // Handle non-200 HTTP status codes (network/server errors)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            console.error('Location API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get location by ID
     * GET /api/location/{id}
     */
    getLocationById = async (id: number): Promise<LocationDto> => {
        const response = await this.request<LocationDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch location');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get paginated list of locations
     * GET /api/location
     */
    getLocations = async (params: {
        page?: number;
        pageSize?: number;
        isActive?: boolean;
        userId?: number;
    } = {}): Promise<PaginatedResult<LocationDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
        if (params.userId !== undefined) searchParams.append('userId', params.userId.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<LocationDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch locations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get locations by region
     * GET /api/location/region/{regionId}
     */
    getLocationsByRegion = async (
        regionId: number,
        params: {
            page?: number;
            pageSize?: number;
            isActive?: boolean;
        } = {}
    ): Promise<PaginatedResult<LocationDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/region/${regionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<PaginatedResult<LocationDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch locations by region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get locations by user ID (for customer locations)
     * GET /api/location/user/{userId}
     */
    getLocationsByUserId = async (userId: number): Promise<LocationDto[]> => {
        const response = await this.request<LocationDto[]>(`/user/${userId}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch customer locations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get locations dropdown
     * GET /api/location/dropdown
     */
    getLocationsDropdown = async (params: {
        isActive?: boolean;
    } = {}): Promise<LocationDropdownDto[]> => {
        const searchParams = new URLSearchParams();

        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/dropdown${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<LocationDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch locations dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get locations dropdown by region
     * GET /api/location/dropdown/region/{regionId}
     */
    getLocationsDropdownByRegion = async (
        regionId: number,
        params: {
            isActive?: boolean;
        } = {}
    ): Promise<LocationDropdownDto[]> => {
        const searchParams = new URLSearchParams();

        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/dropdown/region/${regionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<LocationDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch locations dropdown by region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new location
     * POST /api/location
     */
    createLocation = async (data: CreateLocationDto): Promise<LocationDto> => {
        const response = await this.request<LocationDto>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create location');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing location
     * PUT /api/location/{id}
     */
    updateLocation = async (id: number, data: UpdateLocationDto): Promise<LocationDto> => {
        const response = await this.request<LocationDto>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update location');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle location activation status
     * PUT /api/location/{id}/toggle-activation
     */
    toggleLocationActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle location activation');
        }
    };

    /**
     * Delete a location (soft delete)
     * DELETE /api/location/{id}
     */
    deleteLocation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete location');
        }
    };

    /**
     * Get locations missing translations (returns location IDs)
     * GET /api/location/missing-translations
     */
    getLocationsMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch locations missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
