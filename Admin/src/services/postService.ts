// Post API Service
// Based on the PostController API endpoints

import TokenManager from '@/utils/tokenManager';

export interface PostLocalizedDto {
    id: number;
    postId: number;
    languageId: number;
    languageCode: string;
    languageName: string;
    descriptionLocalized: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PostDto {
    id: number;
    userId: number;
    description: string;
    numberOfReactions: number;
    postTypeId: number;
    postTypeName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    mediaUrls: string[];
    localizations: PostLocalizedDto[];
}

export interface CreatePostLocalizedDto {
    languageId: number;
    descriptionLocalized: string;
    isActive?: boolean;
}

export interface CreatePostDto {
    userId: number;
    description: string;
    numberOfReactions?: number;
    postTypeId: number;
    isActive?: boolean;
    mediaUrls: string[];
    localizations: CreatePostLocalizedDto[];
}

export interface CreatePostWithMediaDto {
    providerId: number;
    description?: string;
    postTypeId: number;
    isActive: boolean;
    mediaUrls: string[];
    localizations: CreatePostLocalizedDto[];
}

export interface UpdatePostLocalizedDto {
    id?: number | null; // Optional (null for new translations)
    languageId: number;
    descriptionLocalized: string;
    isActive: boolean;
}

export interface UpdatePostDto {
    description: string;
    numberOfReactions: number;
    postTypeId: number;
    isActive: boolean;
    mediaUrls: string[];
    localizations: UpdatePostLocalizedDto[];
}

export interface PostDropdownDto {
    id: number;
    description?: string;
    userId: number;
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

class PostService {
    private readonly baseUrl = '/api/posts';

    private request = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...TokenManager.getAuthHeaders(), // Add authentication headers
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
            console.error('Post API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of posts
     * GET /api/posts
     */
    getPosts = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<PostDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<PostDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get paginated list of posts with localized descriptions
     * GET /api/posts/localized
     */
    getPostsLocalized = async (params: {
        page?: number;
        pageSize?: number;
        languageCode?: string;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<PostDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.languageCode) searchParams.append('languageCode', params.languageCode);
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = `/localized${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await this.request<PaginatedResult<PostDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch localized posts');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get post by ID
     * GET /api/posts/{id}
     */
    getPostById = async (id: number): Promise<PostDto> => {
        const response = await this.request<PostDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch post');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new post with media support
     * POST /api/posts/create
     */
    createPostWithMedia = async (data: CreatePostWithMediaDto): Promise<PostDto> => {
        const response = await this.request<PostDto>('/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create post');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing post
     * PUT /api/posts/{id}
     */
    updatePost = async (id: number, data: UpdatePostDto): Promise<PostDto> => {
        const response = await this.request<PostDto>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update post');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle post activation status
     * PUT /api/posts/{id}/toggle-activation
     */
    togglePostActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle post activation');
        }
    };

    /**
     * Delete a post (soft delete)
     * DELETE /api/posts/{id}
     */
    deletePost = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete post');
        }
    };

    /**
     * Get posts by page with cursor-based pagination for infinite scroll
     * GET /api/posts/by-page/{postsPagesId}
     */
    getPostsByPageWithCursor = async (params: {
        postsPagesId: number;
        languageCode?: string;
        cursor?: number;
        pageSize?: number;
    }): Promise<{
        items: PostDto[];
        nextCursor?: number;
        hasMore: boolean;
    }> => {
        const { postsPagesId, languageCode = 'en', cursor, pageSize = 10 } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('languageCode', languageCode);
        queryParams.append('pageSize', pageSize.toString());
        
        if (cursor !== undefined) {
            queryParams.append('cursor', cursor.toString());
        }

        const endpoint = `/by-page/${postsPagesId}?${queryParams.toString()}`;
        const response = await this.request<{
            items: PostDto[];
            nextCursor?: number;
            hasMore: boolean;
        }>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch posts by page');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const postService = new PostService();
export default postService;
