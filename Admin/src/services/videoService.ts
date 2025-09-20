// Video Upload API Service
// Based on the VideoController API endpoints

import TokenManager from '@/utils/tokenManager';

export interface VideoUploadResponseDto {
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    duration: string;
    width: number;
    height: number;
    format: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    messageCode: string;
    data?: T;
}

class VideoService {
    private readonly baseUrl = '/api/videos';

    private request = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                ...TokenManager.getAuthHeaders(), // Add authentication headers
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);

            // Handle non-200 HTTP status codes
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            console.error('Video API Request Error:', error);
            throw error;
        }
    };

    /**
     * Upload a video file to the server
     * POST /api/videos/upload
     */
    uploadVideo = async (file: File, folder: string = 'videos'): Promise<VideoUploadResponseDto> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await this.request<VideoUploadResponseDto>('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to upload video');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get information about an uploaded video
     * GET /api/videos/{folder}/{fileName}
     */
    getVideoInfo = async (folder: string, fileName: string): Promise<VideoUploadResponseDto> => {
        const response = await this.request<VideoUploadResponseDto>(`/${folder}/${fileName}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to get video info');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Delete an uploaded video
     * DELETE /api/videos/{folder}/{fileName}
     */
    deleteVideo = async (folder: string, fileName: string): Promise<void> => {
        const response = await this.request<void>(`/${folder}/${fileName}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete video');
        }
    };

    /**
     * List all videos in a specific folder
     * GET /api/videos/list/{folder}
     */
    listVideos = async (folder: string): Promise<VideoUploadResponseDto[]> => {
        const response = await this.request<VideoUploadResponseDto[]>(`/list/${folder}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to list videos');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Validate file before upload (client-side validation)
     */
    validateFile = (file: File): { isValid: boolean; error?: string } => {
        const maxSizeInMB = 100; // 100MB for videos (matching backend limit)
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        const allowedTypes = [
            'video/mp4',
            'video/quicktime', // .mov
            'video/x-msvideo', // .avi
            'video/x-matroska', // .mkv
            'video/webm',
            'video/x-flv',
            'video/x-ms-wmv',
            'video/mp4' // .m4v
        ];

        const allowedExtensions = [
            '.mp4',
            '.mov',
            '.avi',
            '.mkv',
            '.webm',
            '.flv',
            '.wmv',
            '.m4v'
        ];

        if (!file) {
            return { isValid: false, error: 'No file selected' };
        }

        if (file.size > maxSizeInBytes) {
            return { isValid: false, error: `File size must be less than ${maxSizeInMB}MB` };
        }

        // Check MIME type
        const isValidMimeType = allowedTypes.includes(file.type.toLowerCase());

        // Check file extension as fallback
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidExtension = allowedExtensions.includes(fileExtension);

        if (!isValidMimeType && !isValidExtension) {
            return {
                isValid: false,
                error: `Invalid video format. Supported formats: ${allowedExtensions.join(', ')}`
            };
        }

        return { isValid: true };
    };
}

// Export singleton instance
const videoService = new VideoService();
export default videoService;
