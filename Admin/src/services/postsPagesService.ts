// PostsPages API Service
// Based on the PostsPagesController API endpoints

export interface PostsPagesLocalizedDto {
    id: number;
    postsPagesId: number;
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostsPagesLocalizedDto {
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    isActive?: boolean;
}

export interface UpdatePostsPagesLocalizedDto {
    id?: number; // Optional (null for new translations)
    nameLocalized: string;
    descriptionLocalized: string;
    languageId: number;
    isActive: boolean;
}

export interface PostTypeDto {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IncludedPostTypeDto {
    id: number;
    postsPagesId: number;
    postTypeId: number;
    postType: PostTypeDto;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PostsPages {
    id: number;
    key: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: PostsPagesLocalizedDto[];
    includedPostTypes: IncludedPostTypeDto[];
}

export interface CreatePostsPagesDto {
    key: string;
    name: string;
    description: string;
    localizations: CreatePostsPagesLocalizedDto[];
    includedPostTypeIds: number[];
}

export interface UpdatePostsPagesDto {
    key: string;
    name: string;
    description: string;
    isActive: boolean;
    localizations: UpdatePostsPagesLocalizedDto[];
    includedPostTypeIds: number[];
}

export interface PostsPagesDropdownDto {
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

class PostsPagesService {
    private readonly baseUrl = '/api/posts-pages';

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
     * Get paginated list of posts pages
     * GET /api/posts-pages
     */
    getPostsPages = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<PostsPages>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<PostsPages>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get posts pages by ID
     * GET /api/posts-pages/{id}
     */
    getPostsPagesById = async (id: number): Promise<PostsPages> => {
        const response = await this.request<PostsPages>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get posts pages by key
     * GET /api/posts-pages/by-key/{key}
     */
    getPostsPagesByKey = async (key: string): Promise<PostsPages> => {
        const response = await this.request<PostsPages>(`/by-key/${encodeURIComponent(key)}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new posts pages
     * POST /api/posts-pages
     */
    createPostsPages = async (data: CreatePostsPagesDto): Promise<PostsPages> => {
        const response = await this.request<PostsPages>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create posts pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing posts pages
     * PUT /api/posts-pages/{id}
     */
    updatePostsPages = async (id: number, data: UpdatePostsPagesDto): Promise<PostsPages> => {
        const response = await this.request<PostsPages>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update posts pages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Delete a posts pages (soft delete)
     * DELETE /api/posts-pages/{id}
     */
    deletePostsPages = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete posts pages');
        }
    };

    /**
     * Toggle posts pages activation status
     * PATCH /api/posts-pages/{id}/toggle-activation
     */
    togglePostsPagesActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PATCH',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle posts pages activation');
        }
    };

    /**
     * Get posts pages for dropdown/select components
     * GET /api/posts-pages/dropdown
     */
    getPostsPagesDropdown = async (): Promise<PostsPagesDropdownDto[]> => {
        const response = await this.request<PostsPagesDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts pages dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update included post types for a posts pages
     * PUT /api/posts-pages/{id}/included-post-types
     */
    updateIncludedPostTypes = async (id: number, postTypeIds: number[]): Promise<void> => {
        const response = await this.request<void>(`/${id}/included-post-types`, {
            method: 'PUT',
            body: JSON.stringify(postTypeIds),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update included post types');
        }
    };
}

// Export singleton instance
export const postsPagesService = new PostsPagesService();
export default postsPagesService;
