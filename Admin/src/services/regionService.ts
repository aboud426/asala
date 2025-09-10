// Region API Service
// Based on the RegionController.cs endpoints

export interface LocalizedRegionDto {
    id: number;
    name: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RegionDto {
    id: number;
    name: string;
    parentId: number | null;
    parentName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children: RegionDto[];
    localizations: LocalizedRegionDto[];
}

export interface CreateLocalizedRegionDto {
    name: string;
    languageId: number;
    isActive?: boolean;
}

export interface CreateRegionDto {
    name: string;
    parentId: number | null;
    isActive?: boolean;
    localizations: CreateLocalizedRegionDto[];
}

export interface UpdateLocalizedRegionDto {
    id?: number; // Optional (null for new translations)
    name: string;
    languageId: number;
    isActive: boolean;
}

export interface UpdateRegionDto {
    name: string;
    parentId: number | null;
    isActive: boolean;
    localizations: UpdateLocalizedRegionDto[];
}

export interface RegionDropdownDto {
    id: number;
    name: string;
    parentId: number | null;
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
            console.error('Region API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get region by ID
     * GET /api/region/{id}
     */
    getRegionById = async (id: number): Promise<RegionDto> => {
        const response = await this.request<RegionDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch region');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get paginated list of regions
     * GET /api/region
     */
    getRegions = async (params: {
        page?: number;
        pageSize?: number;
        isActive?: boolean;
    } = {}): Promise<PaginatedResult<RegionDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<RegionDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch regions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get regions dropdown
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
     * Get region tree structure
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
     * Get subregions of a parent region
     * GET /api/region/{parentId}/subregions
     */
    getSubRegions = async (
        parentId: number,
        params: {
            isActive?: boolean;
        } = {}
    ): Promise<RegionDto[]> => {
        const searchParams = new URLSearchParams();

        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

        const endpoint = `/${parentId}/subregions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<RegionDto[]>(endpoint);

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
    createRegion = async (data: CreateRegionDto): Promise<RegionDto> => {
        const response = await this.request<RegionDto>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

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
    updateRegion = async (id: number, data: UpdateRegionDto): Promise<RegionDto> => {
        const response = await this.request<RegionDto>(`/${id}`, {
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