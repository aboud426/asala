// Customer Admin API Service
// Based on the CustomerAdminController API endpoints

export interface CustomerDto {
    userId: number;
    name: string;
    phoneNumber?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerAdminDto {
    name: string;
    phoneNumber: string;
    isActive: boolean;
}

export interface UpdateCustomerDto {
    name: string;
    phoneNumber?: string;
    isActive: boolean;
}

export interface CustomerDropdownDto {
    userId: number;
    name: string;
    email: string;
}

export enum CustomerSortBy {
    Name = 0
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

class CustomerAdminService {
    private readonly baseUrl = '/api/admin/customers';

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
            console.error('Customer Admin API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of customers
     * GET /api/admin/customers
     */
    getCustomers = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<CustomerDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<CustomerDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch customers');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get customer by user ID
     * GET /api/admin/customers/{userId}
     */
    getCustomerById = async (userId: number): Promise<CustomerDto | null> => {
        const response = await this.request<CustomerDto>(`/${userId}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch customer');
        }

        return response.data || null;
    };

    /**
     * Create a new customer
     * POST /api/admin/customers
     */
    createCustomer = async (data: CreateCustomerAdminDto): Promise<CustomerDto> => {
        const response = await this.request<CustomerDto>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create customer');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing customer
     * PUT /api/admin/customers/{userId}
     */
    updateCustomer = async (userId: number, data: UpdateCustomerDto): Promise<CustomerDto> => {
        const response = await this.request<CustomerDto>(`/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update customer');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle customer activation status
     * PATCH /api/admin/customers/{userId}/toggle-activation
     */
    toggleCustomerActivation = async (userId: number): Promise<void> => {
        const response = await this.request<void>(`/${userId}/toggle-activation`, {
            method: 'PATCH',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle customer activation');
        }
    };

    /**
     * Delete a customer (soft delete)
     * DELETE /api/admin/customers/{userId}
     */
    deleteCustomer = async (userId: number): Promise<void> => {
        const response = await this.request<void>(`/${userId}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete customer');
        }
    };

    /**
     * Get customers dropdown list
     * GET /api/admin/customers/dropdown
     */
    getCustomersDropdown = async (activeOnly: boolean = true): Promise<CustomerDropdownDto[]> => {
        const searchParams = new URLSearchParams();
        searchParams.append('activeOnly', activeOnly.toString());

        const endpoint = `/dropdown?${searchParams.toString()}`;
        const response = await this.request<CustomerDropdownDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch customers dropdown');
        }

        return response.data || [];
    };

    /**
     * Search customers by name
     * GET /api/admin/customers/search
     */
    searchCustomers = async (params: {
        searchTerm: string;
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
        sortBy?: CustomerSortBy;
    }): Promise<PaginatedResult<CustomerDto>> => {
        const searchParams = new URLSearchParams();

        searchParams.append('searchTerm', params.searchTerm);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());
        if (params.sortBy !== undefined) searchParams.append('sortBy', params.sortBy.toString());

        const endpoint = `/search?${searchParams.toString()}`;
        const response = await this.request<PaginatedResult<CustomerDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to search customers');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const customerAdminService = new CustomerAdminService();
export default customerAdminService;
