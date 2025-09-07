// PostType API Service
// Based on the API documentation for post type endpoints

export interface PostTypeLocalizedDto {
    id: number;
    name: string;
    description: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PostType {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: PostTypeLocalizedDto[];
}

export interface CreatePostTypeLocalizedDto {
    name: string;
    description: string;
    languageId: number;
    isActive?: boolean;
}

export interface CreatePostTypeDto {
    name: string;
    description: string;
    isActive?: boolean;
    localizations: CreatePostTypeLocalizedDto[];
}

export interface UpdatePostTypeLocalizedDto {
    id?: number; // Optional (null for new translations)
    name: string;
    description: string;
    languageId: number;
    isActive: boolean;
}

export interface UpdatePostTypeDto {
    name: string;
    description: string;
    isActive: boolean;
    localizations: UpdatePostTypeLocalizedDto[];
}

export interface PostTypeDropdownDto {
    id: number;
    name: string;
    description: string;
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

class PostTypeService {
    private readonly baseUrl = '/api/post-types';

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
     * Get paginated list of post types
     * GET /api/post-types
     */
    getPostTypes = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<PostType>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<PostType>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post types');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get post type by ID
     * GET /api/post-types/{id}
     */
    getPostTypeById = async (id: number): Promise<PostType> => {
        const response = await this.request<PostType>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post type');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get post type by name
     * GET /api/post-types/by-name/{name}
     */
    getPostTypeByName = async (name: string): Promise<PostType> => {
        const response = await this.request<PostType>(`/by-name/${encodeURIComponent(name)}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post type');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new post type
     * POST /api/post-types
     */
    createPostType = async (data: CreatePostTypeDto): Promise<PostType> => {
        const response = await this.request<PostType>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create post type');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing post type
     * PUT /api/post-types/{id}
     */
    updatePostType = async (id: number, data: UpdatePostTypeDto): Promise<PostType> => {
        const response = await this.request<PostType>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update post type');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle post type activation status
     * PUT /api/post-types/{id}/toggle-activation
     */
    togglePostTypeActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle post type activation');
        }
    };

    /**
     * Delete a post type (soft delete)
     * DELETE /api/post-types/{id}
     */
    deletePostType = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete post type');
        }
    };

    /**
     * Get post types missing translations (returns post type IDs)
     * GET /api/post-types/missing-translations
     */
    getPostTypesMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post types missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get post types for dropdown/select components
     * GET /api/post-types/dropdown
     */
    getPostTypesDropdown = async (): Promise<PostTypeDropdownDto[]> => {
        const response = await this.request<PostTypeDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post types dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const postTypeService = new PostTypeService();
export default postTypeService;
