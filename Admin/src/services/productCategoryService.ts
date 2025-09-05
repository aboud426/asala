// Product Category API Service
// Based on the API documentation for product category endpoints

export interface ProductCategoryLocalizedDto {
    id: number;
    productCategoryId: number;
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductCategoryLocalizedDto {
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
}

export interface UpdateProductCategoryLocalizedDto {
    id?: number | null; // Null for new translations
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    isActive?: boolean;
}

export interface ProductCategory {
    id: number;
    name: string;
    description: string;
    parentId?: number | null;
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: ProductCategoryLocalizedDto[];
}

export interface CreateProductCategoryDto {
    name: string;
    description: string;
    parentId?: number | null;
    imageUrl?: string;
    isActive?: boolean;
    localizations?: CreateProductCategoryLocalizedDto[];
}

export interface UpdateProductCategoryDto {
    name: string;
    description: string;
    parentId?: number | null;
    imageUrl?: string;
    isActive: boolean;
    localizations?: UpdateProductCategoryLocalizedDto[];
}

export interface ProductCategoryDropdownDto {
    id: number;
    name: string;
    parentId?: number | null;
    imageUrl?: string;
}

export interface ProductCategoryTreeDto {
    id: number;
    name: string;
    description: string;
    parentId?: number | null;
    imageUrl?: string;
    isActive: boolean;
    localizations: ProductCategoryLocalizedDto[];
    children: ProductCategoryTreeDto[];
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

class ProductCategoryService {
    private readonly baseUrl = '/api/product-categories';

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
     * Get paginated list of product categories
     * GET /api/product-categories
     */
    getProductCategories = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<ProductCategory>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<ProductCategory>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch product categories');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get product categories for dropdown/select components
     * GET /api/product-categories/dropdown
     */
    getProductCategoriesDropdown = async (): Promise<ProductCategoryDropdownDto[]> => {
        const response = await this.request<ProductCategoryDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch product categories dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get product category tree
     * GET /api/product-categories/tree
     */
    getProductCategoryTree = async (rootId?: number, languageCode?: string): Promise<ProductCategoryTreeDto[]> => {
        const searchParams = new URLSearchParams();
        if (rootId) searchParams.append('rootId', rootId.toString());
        if (languageCode) searchParams.append('languageCode', languageCode);

        const endpoint = `/tree${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<ProductCategoryTreeDto[]>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch product category tree');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new product category
     * POST /api/product-categories
     */
    createProductCategory = async (data: CreateProductCategoryDto): Promise<ProductCategory> => {
        const response = await this.request<ProductCategory>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create product category');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing product category
     * PUT /api/product-categories/{id}
     */
    updateProductCategory = async (id: number, data: UpdateProductCategoryDto): Promise<ProductCategory> => {
        const response = await this.request<ProductCategory>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update product category');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle product category activation status
     * PUT /api/product-categories/{id}/toggle-activation
     */
    toggleProductCategoryActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle product category activation');
        }
    };

    /**
     * Delete a product category (soft delete)
     * DELETE /api/product-categories/{id}
     */
    deleteProductCategory = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete product category');
        }
    };

    /**
     * Get product categories missing translations (returns product category IDs)
     * GET /api/product-categories/missing-translations
     */
    getProductCategoriesMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch product categories missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const productCategoryService = new ProductCategoryService();
export default productCategoryService;
