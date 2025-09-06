// Employee API Service
// Based on the EmployeeController endpoints

export interface EmployeeDto {
    userId: number; // Primary Key  
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmployeeDto {
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
}

export interface UpdateEmployeeDto {
    name: string;
    email: string;
    password?: string;
    isActive: boolean;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface UserDto {
    id: number;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponseDto {
    token: string;
    user: UserDto;
    expiresAt: string;
}

export enum EmployeeSortBy {
    Name = 'Name'
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

class EmployeeService {
    private readonly baseUrl = '/api/employees';

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
            console.error('Employee API Request Error:', error);
            throw error;
        }
    };

    /**
     * Create a new employee
     * POST /api/employees/create
     */
    registerEmployee = async (data: CreateEmployeeDto): Promise<EmployeeDto> => {
        const response = await this.request<EmployeeDto>('/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create employee');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Login employee
     * POST /api/employees/login
     */
    loginEmployee = async (data: LoginDto): Promise<AuthResponseDto> => {
        const response = await this.request<AuthResponseDto>('/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to login employee');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Logout employee
     * POST /api/employees/logout
     */
    logoutEmployee = async (): Promise<void> => {
        const response = await this.request<void>('/logout', {
            method: 'POST',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to logout employee');
        }
    };

    /**
     * Get paginated list of employees
     * GET /api/employees
     */
    getEmployees = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<EmployeeDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<EmployeeDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch employees');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get employee by ID
     * GET /api/employees/{id}
     */
    getEmployeeById = async (id: number): Promise<EmployeeDto> => {
        const response = await this.request<EmployeeDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch employee');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update employee
     * PUT /api/employees/edit/{id}
     */
    updateEmployee = async (id: number, data: UpdateEmployeeDto): Promise<EmployeeDto> => {
        const response = await this.request<EmployeeDto>(`/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update employee');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Delete employee (soft delete)
     * DELETE /api/employees/{id}
     */
    deleteEmployee = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete employee');
        }
    };

    /**
     * Search employees by name
     * GET /api/employees/search
     */
    searchEmployees = async (params: {
        searchTerm: string;
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
        sortBy?: EmployeeSortBy;
    }): Promise<PaginatedResult<EmployeeDto>> => {
        const searchParams = new URLSearchParams();
        
        searchParams.append('searchTerm', params.searchTerm);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy.toString());

        const response = await this.request<PaginatedResult<EmployeeDto>>(`/search?${searchParams.toString()}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to search employees');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const employeeService = new EmployeeService();
export default employeeService;
