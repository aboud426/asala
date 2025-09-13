// Product API Service
// Based on the ProductController API

export interface ImageUrlDto {
    url: string;
}

export interface ProductLocalizedDto {
    id: number;
    productId: number;
    languageId: number;
    languageCode: string;
    languageName: string;
    nameLocalized: string;
    descriptionLocalized?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductLocalizedDto {
    nameLocalized: string;
    descriptionLocalized?: string;
    languageId: number;
}

export interface CreateProductWithMediaDto {
    name: string;
    categoryId: number;
    providerId: number;
    price: number;
    quantity: number;
    currencyId: number;
    description?: string;
    mediaUrls: string[];
    isActive: boolean;
    localizeds: CreateProductLocalizedDto[];
}

export interface UpdateProductWithMediaDto {
    name: string;
    categoryId: number;
    providerId: number;
    price: number;
    quantity: number;
    currencyId: number;
    description?: string;
    mediaUrls: string[];
    isActive: boolean;
    localizations: UpdateProductLocalizedDto[];
}

export interface UpdateProductLocalizedDto {
    id?: number;
    languageId: number;
    nameLocalized: string;
    descriptionLocalized?: string;
    isActive: boolean;
}

export interface ProductDto {
    id: number;
    name: string;
    localizedName?: string;
    categoryId: number;
    categoryName?: string; // Added by API join, not in base DTO
    providerId: number;
    providerName?: string; // Added by API join, not in base DTO
    price: number;
    quantity: number;
    currencyId: number;
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
    description?: string;
    localizedDescription?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: ProductLocalizedDto[];
    images: ImageUrlDto[];
    // Computed property for backward compatibility
    mediaUrls?: string[];
}

export interface CategoryDropdownDto {
    id: number;
    name: string;
    parentId?: number;
}

export interface ProviderDropdownDto {
    userId: number;
    businessName: string;
    phoneNumber?: string;
}

export interface CurrencyDropdownDto {
    id: number;
    name: string;
    code: string;
    symbol: string;
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

class ProductService {
    private readonly baseUrl = '/api/products';

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
            console.error('Product API Request Error:', error);
            throw error;
        }
    };

    /**
     * Process a ProductDto from the backend to add computed properties for UI compatibility
     */
    private processProductDto = (product: ProductDto): ProductDto => {
        return {
            ...product,
            // Map images array to mediaUrls array for backward compatibility
            mediaUrls: product.images?.map(img => img.url) || []
        };
    };

    /**
     * Process an array of ProductDto from the backend
     */
    private processProductDtos = (products: ProductDto[]): ProductDto[] => {
        return products.map(product => this.processProductDto(product));
    };

    /**
     * Create a new product with media
     * POST /api/products/create-product
     */
    createProduct = async (data: CreateProductWithMediaDto): Promise<ProductDto> => {
        const response = await this.request<ProductDto>('/create-product', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create product');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return this.processProductDto(response.data);
    };

    /**
     * Get product by ID
     * GET /api/products/{id}
     */
    getProductById = async (id: number): Promise<ProductDto> => {
        const response = await this.request<ProductDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to get product');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return this.processProductDto(response.data);
    };

    /**
     * Update product with media
     * PUT /api/products/{id}
     */
    updateProduct = async (id: number, data: UpdateProductWithMediaDto): Promise<ProductDto> => {
        const response = await this.request<ProductDto>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update product');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return this.processProductDto(response.data);
    };

    /**
     * Get paginated list of products with localization
     * GET /api/products
     */
    getProducts = async (params: {
        page?: number;
        pageSize?: number;
        languageCode?: string;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<ProductDto>> => {
        const queryParams = new URLSearchParams();

        // Set default values to match ProductController
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const languageCode = params.languageCode || 'en';

        queryParams.append('page', page.toString());
        queryParams.append('pageSize', pageSize.toString());
        queryParams.append('languageCode', languageCode);

        if (params.activeOnly !== undefined) {
            queryParams.append('activeOnly', params.activeOnly.toString());
        }

        const endpoint = `?${queryParams.toString()}`;
        const response = await this.request<PaginatedResult<ProductDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        // Process the products in the paginated result
        return {
            ...response.data,
            items: this.processProductDtos(response.data.items)
        };
    };

    /**
     * Get all products without pagination (for stats and dropdown purposes)
     * GET /api/products with large pageSize
     */
    getAllProducts = async (params: {
        languageCode?: string;
        activeOnly?: boolean;
    } = {}): Promise<ProductDto[]> => {
        const result = await this.getProducts({
            page: 1,
            pageSize: 1000, // Large number to get all products
            languageCode: params.languageCode,
            activeOnly: params.activeOnly
        });

        return result.items;
    };

    /**
     * Get categories for dropdown/select components
     * GET /api/categories/dropdown
     */
    getCategoriesDropdown = async (): Promise<CategoryDropdownDto[]> => {
        const url = '/api/categories/dropdown';

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<CategoryDropdownDto[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch categories dropdown');
        }

        if (!data.data) {
            throw new Error('No data returned from server');
        }

        return data.data;
    };

    /**
     * Get providers for dropdown/select components
     * GET /api/providers/dropdown
     */
    getProvidersDropdown = async (languageCode: string = 'en'): Promise<ProviderDropdownDto[]> => {
        const url = `/api/providers/dropdown?languageCode=${languageCode}&activeOnly=true`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ProviderDropdownDto[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch providers dropdown');
        }

        if (!data.data) {
            throw new Error('No data returned from server');
        }

        return data.data;
    };

    /**
     * Get currencies for dropdown/select components
     * GET /api/currencies/dropdown
     */
    getCurrenciesDropdown = async (activeOnly: boolean = true): Promise<CurrencyDropdownDto[]> => {
        const url = `/api/currencies/dropdown?activeOnly=${activeOnly}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<CurrencyDropdownDto[]> = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch currencies dropdown');
        }

        if (!data.data) {
            throw new Error('No data returned from server');
        }

        return data.data;
    };

    /**
     * Get products by page with cursor-based pagination for infinite scroll
     * GET /api/products/by-page/{productsPagesId}
     */
    getProductsByPageWithCursor = async (params: {
        productsPagesId: number;
        languageCode?: string;
        cursor?: number;
        pageSize?: number;
    }): Promise<{
        items: ProductDto[];
        nextCursor?: number;
        hasMore: boolean;
    }> => {
        const { productsPagesId, languageCode = 'en', cursor, pageSize = 10 } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('languageCode', languageCode);
        queryParams.append('pageSize', pageSize.toString());
        
        if (cursor !== undefined) {
            queryParams.append('cursor', cursor.toString());
        }

        const endpoint = `/by-page/${productsPagesId}?${queryParams.toString()}`;
        const response = await this.request<{
            items: ProductDto[];
            nextCursor?: number;
            hasMore: boolean;
        }>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch products by page');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        // Process the products in the cursor-based result
        return {
            ...response.data,
            items: this.processProductDtos(response.data.items)
        };
    };
}

// Export singleton instance
export const productService = new ProductService();
export default productService;

