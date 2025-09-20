import TokenManager from '@/utils/tokenManager';

// Types for the Reel API
export interface CreateReelCommand {
    userId: number;
    description: string;
    postTypeId: number;
    mediaUrls?: CreateBasePostMediaDto[];
    localizations?: CreateBasePostLocalizedDto[];
}

export interface CreateBasePostMediaDto {
    url: string;
    mediaType: number;
    displayOrder?: number;
}

export interface CreateBasePostLocalizedDto {
    languageId: number;
    description: string;
}

export interface ReelDto {
    postId: number;
    basePost: BasePostDto;
}

export interface BasePostDto {
    id: number;
    userId: number;
    description: string;
    numberOfReactions: number;
    postTypeId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    postMedias: BasePostMediaDto[];
    localizations: BasePostLocalizedDto[];
}

export interface BasePostMediaDto {
    id: number;
    url: string;
    mediaType: number;
    displayOrder: number;
}

export interface BasePostLocalizedDto {
    id: number;
    languageId: number;
    description: string;
    languageName: string;
    languageCode: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    messageCode: string;
    data?: T;
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

// MediaType enum values from the API documentation
export enum MediaType {
    Image = 1,
    Video = 2,
    Audio = 3,
    Document = 4,
    Other = 5
}

export class ReelService {
    private readonly baseUrl = '/api/reels';

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
            console.error('Reel API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get paginated list of reels
     * GET /api/reels
     */
    getReels = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
        userId?: number;
        description?: string;
        createdAfter?: string;
        createdBefore?: string;
        minReactions?: number;
        maxReactions?: number;
        sortBy?: 'CreatedAt' | 'UpdatedAt' | 'NumberOfReactions';
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<PaginatedResult<ReelDto>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());
        if (params.userId) searchParams.append('userId', params.userId.toString());
        if (params.description) searchParams.append('description', params.description);
        if (params.createdAfter) searchParams.append('createdAfter', params.createdAfter);
        if (params.createdBefore) searchParams.append('createdBefore', params.createdBefore);
        if (params.minReactions) searchParams.append('minReactions', params.minReactions.toString());
        if (params.maxReactions) searchParams.append('maxReactions', params.maxReactions.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<ReelDto>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch reels');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get reel by ID
     * GET /api/reels/{id}
     */
    getReelById = async (id: number): Promise<ReelDto> => {
        const response = await this.request<ReelDto>(`/${id}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch reel');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new reel
     * POST /api/reels/create
     */
    createReel = async (data: CreateReelCommand): Promise<ReelDto> => {
        const response = await this.request<ReelDto>('/create', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create reel');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Helper method to determine media type from file
     */
    static getMediaTypeFromFile = (file: File): MediaType => {
        if (file.type.startsWith('image/')) {
            return MediaType.Image;
        } else if (file.type.startsWith('video/')) {
            return MediaType.Video;
        } else if (file.type.startsWith('audio/')) {
            return MediaType.Audio;
        } else {
            return MediaType.Other;
        }
    };

    /**
     * Helper method to determine media type from filename
     */
    static getMediaTypeFromFilename = (filename: string): MediaType => {
        const extension = filename.toLowerCase().split('.').pop();
        
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
        
        if (extension && imageExtensions.includes(extension)) {
            return MediaType.Image;
        } else if (extension && videoExtensions.includes(extension)) {
            return MediaType.Video;
        } else if (extension && audioExtensions.includes(extension)) {
            return MediaType.Audio;
        } else {
            return MediaType.Other;
        }
    };
}

const reelService = new ReelService();
export default reelService;
