// Region API Service
// Based on the RegionController endpoints

export interface LocalizedRegionDto {
    id: number;
    regionId: number;
    languageId: number;
    localizedName: string;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
}

export interface Region {
    id: number;
    name: string;
    parentId?: number;
    parentName?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children: Region[];
    localizations: LocalizedRegionDto[];
}

export interface CreateLocalizedRegionDto {
    regionId: number;
    languageId: number;
    localizedName: string;
    isActive?: boolean;
}

export interface CreateRegionDto {
    name: string;
    parentId?: number;
    isActive?: boolean;
    localizations: CreateLocalizedRegionDto[];
}

export interface UpdateLocalizedRegionDto {
    id?: number; // Optional (null for new translations)
    languageId: number;
    localizedName: string;
    isActive: boolean;
}

export interface UpdateRegionDto {
    name: string;
    parentId?: number;
    isActive: boolean;
    localizations: UpdateLocalizedRegionDto[];
}

export interface RegionDropdownDto {
    id: number;
    name: string;
    parentId?: number;
    fullPath: string;
}

export interface RegionHierarchyDto {
    id: number;
    name: string;
    level: number;
    children: RegionHierarchyDto[];
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

class RegionService {
    private readonly baseUrl = '/api/region';

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
            console.error('API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of regions
     * GET /api/region
     */
    getRegions = async (params: {
        page?: number;
        pageSize?: number;
        isActive?: boolean;
    } = {}): Promise<PaginatedResult<Region>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Region>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch regions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }
        console.log(response.data);

        return response.data;
    };

    /**
     * Get region by ID
     * GET /api/region/{id}
     */
    getRegionById = async (id: number): Promise<Region> => {
        const response = await this.request<Region>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get regions for dropdown/select components
     * GET /api/region/dropdown
     */
    getRegionsDropdown = async (params: {
        isActive?: boolean;
    } = {}): Promise<RegionDropdownDto[]> => {
        const searchParams = new URLSearchParams();
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/dropdown${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<RegionDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch regions dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get region tree structure with all subregions
     * GET /api/region/tree
     */
    getRegionTree = async (params: {
        isActive?: boolean;
    } = {}): Promise<RegionHierarchyDto[]> => {
        const searchParams = new URLSearchParams();
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/tree${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<RegionHierarchyDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch region tree');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get subregions of a specific parent region
     * GET /api/region/{parentId}/subregions
     */
    getSubRegions = async (parentId: number, params: {
        isActive?: boolean;
    } = {}): Promise<Region[]> => {
        const searchParams = new URLSearchParams();
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/${parentId}/subregions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<Region[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch subregions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new region
     * POST /api/region
     */
    createRegion = async (data: CreateRegionDto): Promise<Region> => {
        const response = await this.request<Region>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        console.log(response);

        if (!response.success) {
            throw new Error(response.message || 'Failed to create region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing region
     * PUT /api/region/{id}
     */
    updateRegion = async (id: number, data: UpdateRegionDto): Promise<Region> => {
        const response = await this.request<Region>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle region activation status
     * PUT /api/region/{id}/toggle-activation
     */
    toggleRegionActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle region activation');
        }
    };

    /**
     * Delete a region (soft delete)
     * DELETE /api/region/{id}
     */
    deleteRegion = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete region');
        }
    };

    /**
     * Get regions missing translations (returns region IDs)
     * GET /api/region/missing-translations
     */
    getRegionsMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch regions missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const regionService = new RegionService();
export default regionService;
