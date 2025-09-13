// ProductsPages API Service
// Based on the ProductsPagesController API endpoints

import TokenManager from '@/utils/tokenManager';

export interface ProductsPagesLocalizedDto {
    id: number;
    productsPagesId: number;
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    languageName?: string;
    languageCode?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IncludedProductTypeDto {
    id: number;
    productsPagesId: number;
    productCategoryId: number;
    productCategory: {
        id: number;
        name: string;
        description: string;
        parentId?: number | null;
        imageUrl?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsPages {
    id: number;
    key: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: ProductsPagesLocalizedDto[];
    includedProductTypes: IncludedProductTypeDto[];
}

export interface CreateProductsPagesLocalizedDto {
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
}

export interface CreateProductsPagesDto {
    key: string;
    name: string;
    description: string;
    localizations: CreateProductsPagesLocalizedDto[];
    includedProductCategoryIds: number[];
}

export interface UpdateProductsPagesLocalizedDto {
    id?: number | null; // Null for new translations
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    isActive: boolean;
}

export interface UpdateProductsPagesDto {
    key: string;
    name: string;
    description: string;
    isActive: boolean;
    localizations: UpdateProductsPagesLocalizedDto[];
    includedProductCategoryIds: number[];
}

export interface ProductsPagesDropdownDto {
    id: number;
    key: string;
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

class ProductsPagesService {
    private readonly baseUrl = '/api/products-pages';

    private request = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...TokenManager.getAuthHeaders(),
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
            console.error('ProductsPages API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of products pages
     * GET /api/products-pages
     */
    getProductsPages = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<ProductsPages>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<ProductsPages>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get products pages details by ID
     * GET /api/products-pages/{id}
     */
    getProductsPagesById = async (id: number): Promise<ProductsPages> => {
        const response = await this.request<ProductsPages>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get products pages details by key
     * GET /api/products-pages/by-key/{key}
     */
    getProductsPagesByKey = async (key: string): Promise<ProductsPages> => {
        const response = await this.request<ProductsPages>(`/by-key/${encodeURIComponent(key)}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new products pages
     * POST /api/products-pages
     */
    createProductsPages = async (data: CreateProductsPagesDto): Promise<ProductsPages> => {
        const response = await this.request<ProductsPages>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create products pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing products pages
     * PUT /api/products-pages/{id}
     */
    updateProductsPages = async (id: number, data: UpdateProductsPagesDto): Promise<ProductsPages> => {
        const response = await this.request<ProductsPages>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update products pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Delete a products pages (soft delete)
     * DELETE /api/products-pages/{id}
     */
    deleteProductsPages = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete products pages');
        }
    };

    /**
     * Toggle products pages activation status
     * PATCH /api/products-pages/{id}/toggle-activation
     */
    toggleProductsPagesActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PATCH',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle products pages activation');
        }
    };

    /**
     * Get products pages for dropdown/select components
     * GET /api/products-pages/dropdown
     */
    getProductsPagesDropdown = async (): Promise<ProductsPagesDropdownDto[]> => {
        const response = await this.request<ProductsPagesDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products pages dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update included product categories for a products pages
     * PUT /api/products-pages/{id}/included-product-categories
     */
    updateIncludedProductCategories = async (
        id: number,
        productCategoryIds: number[]
    ): Promise<void> => {
        const response = await this.request<void>(`/${id}/included-product-categories`, {
            method: 'PUT',
            body: JSON.stringify(productCategoryIds),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update included product categories');
        }
    };
}

// Export singleton instance
export const productsPagesService = new ProductsPagesService();
export default productsPagesService;
