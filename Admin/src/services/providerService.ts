// Provider API Service
// Based on the AdminProviderController API

export interface ProviderLocalizedDto {
    id: number;
    providerId: number;
    languageId: number;
    languageCode: string;
    languageName: string;
    businessNameLocalized: string;
    descriptionLocalized: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ImageUrlDto {
    url: string;
}

export interface Provider {
    userId: number;
    phoneNumber?: string;
    businessName: string;
    description: string;
    rating: number;
    parentId?: number;
    parentBusinessName?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    email: string;
    localizations: ProviderLocalizedDto[];
    images: ImageUrlDto[];
}

export interface CreateProviderLocalizedDto {
    languageId: number;
    businessNameLocalized: string;
    descriptionLocalized: string;
    isActive?: boolean;
}

export interface UpdateProviderLocalizedDto {
    id?: number;
    languageId: number;
    businessNameLocalized: string;
    descriptionLocalized: string;
    isActive: boolean;
}

export interface CreateProviderByAdminDto {
    // User information
    email: string;
    phoneNumber?: string;
    locationId?: number;
    isActive?: boolean;

    // Provider information
    businessName: string;
    description: string;
    rating?: number;
    parentId?: number;

    // Localizations
    localizations: CreateProviderLocalizedDto[];
}

export interface UpdateProviderByAdminDto {
    // User information
    email: string;
    phoneNumber?: string;
    locationId?: number;
    isActive: boolean;

    // Provider information
    businessName: string;
    description: string;
    rating: number;
    parentId?: number;

    // Localizations
    localizations: UpdateProviderLocalizedDto[];
    images: ImageUrlDto[];
}

export interface ProviderDropdownDto {
    userId: number;
    businessName: string;
    phoneNumber?: string;
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

class ProviderService {
    private readonly baseUrl = '/api/admin/providers';

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
            console.error('Provider API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of all providers with full details (Admin only)
     * GET /api/admin/providers
     */
    getAll = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
        parentId?: number;
    } = {}): Promise<PaginatedResult<Provider>> => {
        const queryParams = new URLSearchParams();

        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly.toString());
        if (params.parentId !== undefined) queryParams.append('parentId', params.parentId.toString());

        const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Provider>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch providers');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }
        console.log(response.data);
        return response.data;
    };

    /**
     * Get provider details by ID
     * GET /api/providers/{id} (using regular provider endpoint since admin endpoint doesn't have GetById)
     */
    getById = async (id: number): Promise<Provider> => {
        // Use the regular provider endpoint for getting details
        const url = `/api/providers/${id}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<Provider> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch provider');
        }

        if (!data.data) {
            throw new Error('No data returned from server');
        }

        return data.data;
    };

    /**
     * Create a new provider with user information and localization support (Admin only)
     * POST /api/admin/providers
     */
    createProvider = async (data: CreateProviderByAdminDto): Promise<Provider> => {
        const response = await this.request<Provider>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create provider');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing provider with user information and localization support (Admin only)
     * PUT /api/admin/providers/{id}
     */
    updateProvider = async (id: number, data: UpdateProviderByAdminDto): Promise<Provider> => {
        const response = await this.request<Provider>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update provider');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const providerService = new ProviderService();
export default providerService;
