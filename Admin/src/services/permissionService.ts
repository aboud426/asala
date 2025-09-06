// Permission API Service
// Based on the PermissionController endpoints

export interface PermissionLocalizedDto {
    id: number;
    permissionId: number;
    languageId: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    language?: {
        id: number;
        code: string;
        name: string;
    };
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: PermissionLocalizedDto[];
}

export interface CreatePermissionLocalizedDto {
    languageId: number;
    name: string;
    description: string;
}

export interface CreatePermissionDto {
    name: string;
    description: string;
    localizations: CreatePermissionLocalizedDto[];
}

export interface UpdatePermissionLocalizedDto {
    id?: number; // Optional (null for new translations)
    languageId: number;
    name: string;
    description: string;
}

export interface UpdatePermissionDto {
    name: string;
    description: string;
    isActive: boolean;
    localizations: UpdatePermissionLocalizedDto[];
}

export interface PermissionDropdownDto {
    id: number;
    name: string;
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

class PermissionService {
    private readonly baseUrl = '/api/permissions';

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
            console.error('Permission API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of permissions
     * GET /api/permissions
     */
    getPermissions = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<Permission>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Permission>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch permissions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get permission details by ID
     * GET /api/permissions/{id}
     */
    getPermissionById = async (id: number): Promise<Permission> => {
        const response = await this.request<Permission>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch permission');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get permission details by name
     * GET /api/permissions/by-name/{name}
     */
    getPermissionByName = async (name: string): Promise<Permission> => {
        const response = await this.request<Permission>(`/by-name/${encodeURIComponent(name)}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch permission');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get permissions formatted for dropdown selection
     * GET /api/permissions/dropdown
     */
    getPermissionsDropdown = async (activeOnly: boolean = true): Promise<PermissionDropdownDto[]> => {
        const searchParams = new URLSearchParams();
        if (activeOnly !== undefined) searchParams.append('activeOnly', activeOnly.toString());

        const endpoint = searchParams.toString() ? `/dropdown?${searchParams.toString()}` : '/dropdown';
        const response = await this.request<PermissionDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch permissions dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new permission
     * POST /api/permissions
     */
    createPermission = async (data: CreatePermissionDto): Promise<Permission> => {
        const response = await this.request<Permission>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create permission');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing permission
     * PUT /api/permissions/{id}
     */
    updatePermission = async (id: number, data: UpdatePermissionDto): Promise<Permission> => {
        const response = await this.request<Permission>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update permission');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle permission activation status
     * PUT /api/permissions/{id}/toggle-activation
     */
    togglePermissionActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle permission activation');
        }
    };

    /**
     * Delete a permission (soft delete)
     * DELETE /api/permissions/{id}
     */
    deletePermission = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete permission');
        }
    };

    /**
     * Get permissions missing translations (returns permission IDs)
     * GET /api/permissions/missing-translations
     */
    getPermissionsMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch permissions missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const permissionService = new PermissionService();
export default permissionService;
