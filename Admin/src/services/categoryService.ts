// Category API Service
// Based on the API documentation for category endpoints

export interface CategoryLocalizedDto {
    id: number;
    categoryId: number;
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryLocalizedDto {
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
}

export interface UpdateCategoryLocalizedDto {
    id?: number | null; // Null for new translations
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    isActive?: boolean;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    parentId?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: CategoryLocalizedDto[];
}

export interface CreateCategoryDto {
    name: string;
    description: string;
    parentId?: number | null;
    isActive?: boolean;
    localizations?: CreateCategoryLocalizedDto[];
}

export interface UpdateCategoryDto {
    name: string;
    description: string;
    parentId?: number | null;
    isActive: boolean;
    localizations?: UpdateCategoryLocalizedDto[];
}

export interface CategoryDropdownDto {
    id: number;
    name: string;
    parentId?: number | null;
}

export interface CategoryTreeDto {
    id: number;
    name: string;
    description: string;
    parentId?: number | null;
    isActive: boolean;
    localizations: CategoryLocalizedDto[];
    children: CategoryTreeDto[];
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

class CategoryService {
    private readonly baseUrl = '/api/categories';

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
     * Get paginated list of categories
     * GET /api/categories
     */
    getCategories = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<Category>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Category>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch categories');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get categories for dropdown/select components
     * GET /api/categories/dropdown
     */
    getCategoriesDropdown = async (): Promise<CategoryDropdownDto[]> => {
        const response = await this.request<CategoryDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch categories dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new category
     * POST /api/categories
     */
    createCategory = async (data: CreateCategoryDto): Promise<Category> => {
        const response = await this.request<Category>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create category');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing category
     * PUT /api/categories/{id}
     */
    updateCategory = async (id: number, data: UpdateCategoryDto): Promise<Category> => {
        const response = await this.request<Category>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update category');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle category activation status
     * PUT /api/categories/{id}/toggle-activation
     */
    toggleCategoryActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle category activation');
        }
    };

    /**
     * Delete a category (soft delete)
     * DELETE /api/categories/{id}
     */
    deleteCategory = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete category');
        }
    };

    /**
     * Get subcategories for a parent category
     * GET /api/categories/{parentId}/subcategories
     */
    getSubcategories = async (parentId: number, languageCode?: string): Promise<Category[]> => {
        const searchParams = new URLSearchParams();
        if (languageCode) searchParams.append('languageCode', languageCode);

        const endpoint = `/${parentId}/subcategories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<Category[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch subcategories');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get category tree
     * GET /api/categories/tree
     */
    getCategoryTree = async (rootId?: number, languageCode?: string): Promise<CategoryTreeDto[]> => {
        const searchParams = new URLSearchParams();
        if (rootId) searchParams.append('rootId', rootId.toString());
        if (languageCode) searchParams.append('languageCode', languageCode);

        const endpoint = `/tree${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<CategoryTreeDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch category tree');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
