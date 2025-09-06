// Role Permission API Service
// Based on the RolePermissionController endpoints

export interface RolePermissionDto {
    id: number;
    name: string;
    description: string;
    page: string;
    isActive: boolean;
}

export interface SaveRolePermissionsRequest {
    permissionIds: number[];
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    messageCode: string;
    data?: T;
}

class RolePermissionService {
    private readonly baseUrl = '/api/role-permissions';

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
            console.error('Role Permission API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get permissions by role ID with optional language support
     * GET /api/role-permissions/role/{roleId}/permissions
     */
    getPermissionsByRoleId = async (
        roleId: number,
        languageCode?: string
    ): Promise<RolePermissionDto[]> => {
        const searchParams = new URLSearchParams();
        if (languageCode) searchParams.append('languageCode', languageCode);

        const endpoint = `/role/${roleId}/permissions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<RolePermissionDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch role permissions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Save/Set specific permissions for a role (replaces existing permissions)
     * PUT /api/role-permissions/role/{roleId}/permissions
     */
    saveRolePermissions = async (
        roleId: number,
        permissionIds: number[],
        languageCode?: string
    ): Promise<RolePermissionDto[]> => {
        const searchParams = new URLSearchParams();
        if (languageCode) searchParams.append('languageCode', languageCode);

        const endpoint = `/role/${roleId}/permissions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<RolePermissionDto[]>(endpoint, {
            method: 'PUT',
            body: JSON.stringify({ permissionIds }),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to save role permissions');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const rolePermissionService = new RolePermissionService();
export default rolePermissionService;
