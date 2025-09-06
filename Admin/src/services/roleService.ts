// Role API Service
// Based on the RoleController endpoints

export interface RoleLocalizedDto {
    id: number;
    roleId: number;
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

export interface Role {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: RoleLocalizedDto[];
}

export interface CreateRoleLocalizedDto {
    languageId: number;
    name: string;
    description: string;
}

export interface CreateRoleDto {
    name: string;
    description: string;
    localizations: CreateRoleLocalizedDto[];
}

export interface UpdateRoleLocalizedDto {
    id?: number; // Optional (null for new translations)
    languageId: number;
    name: string;
    description: string;
}

export interface UpdateRoleDto {
    name: string;
    description: string;
    isActive: boolean;
    localizations: UpdateRoleLocalizedDto[];
}

export interface RoleDropdownDto {
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

class RoleService {
    private readonly baseUrl = '/api/roles';

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
            console.error('Role API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of roles
     * GET /api/roles
     */
    getRoles = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<Role>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Role>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch roles');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get role details by ID
     * GET /api/roles/{id}
     */
    getRoleById = async (id: number): Promise<Role> => {
        const response = await this.request<Role>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch role');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get role details by name
     * GET /api/roles/name/{name}
     */
    getRoleByName = async (name: string): Promise<Role> => {
        const response = await this.request<Role>(`/name/${encodeURIComponent(name)}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch role');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get roles formatted for dropdown selection
     * GET /api/roles/dropdown
     */
    getRolesDropdown = async (activeOnly: boolean = true): Promise<RoleDropdownDto[]> => {
        const searchParams = new URLSearchParams();
        if (activeOnly !== undefined) searchParams.append('activeOnly', activeOnly.toString());

        const endpoint = searchParams.toString() ? `/dropdown?${searchParams.toString()}` : '/dropdown';
        const response = await this.request<RoleDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch roles dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new role
     * POST /api/roles
     */
    createRole = async (data: CreateRoleDto): Promise<Role> => {
        const response = await this.request<Role>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create role');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing role
     * PUT /api/roles/{id}
     */
    updateRole = async (id: number, data: UpdateRoleDto): Promise<Role> => {
        const response = await this.request<Role>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update role');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle role activation status
     * PUT /api/roles/{id}/toggle-activation
     */
    toggleRoleActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle role activation');
        }
    };

    /**
     * Delete a role (soft delete)
     * DELETE /api/roles/{id}
     */
    deleteRole = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete role');
        }
    };

    /**
     * Get roles missing translations (returns role IDs)
     * GET /api/roles/missing-translations
     */
    getRolesMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch roles missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const roleService = new RoleService();
export default roleService;
