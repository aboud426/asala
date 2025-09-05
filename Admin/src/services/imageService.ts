// Image Upload API Service
// Based on the ImageController API endpoints

export interface ImageUploadResponseDto {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  messageCode: string;
  data?: T;
}

class ImageService {
  private readonly baseUrl = '/api/images';

  private request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, options);
      
      // Handle non-200 HTTP status codes
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('Image API Request Error:', error);
      throw error;
    }
  };

  /**
   * Upload an image file to the server
   * POST /api/images/upload
   */
  uploadImage = async (file: File, folder: string = 'categories'): Promise<ImageUploadResponseDto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await this.request<ImageUploadResponseDto>('/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to upload image');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };

  /**
   * Get information about an uploaded image
   * GET /api/images/{folder}/{fileName}
   */
  getImageInfo = async (folder: string, fileName: string): Promise<ImageUploadResponseDto> => {
    const response = await this.request<ImageUploadResponseDto>(`/${folder}/${fileName}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to get image info');
    }

    if (!response.data) {
      throw new Error('No data returned from server');
    }

    return response.data;
  };

  /**
   * Delete an uploaded image
   * DELETE /api/images/{folder}/{fileName}
   */
  deleteImage = async (folder: string, fileName: string): Promise<void> => {
    const response = await this.request<void>(`/${folder}/${fileName}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete image');
    }
  };

  /**
   * List all images in a specific folder
   * GET /api/images/list/{folder}
   */
  listImages = async (folder: string): Promise<ImageUploadResponseDto[]> => {
    const response = await this.request<ImageUploadResponseDto[]>(`/list/${folder}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to list images');
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
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];

    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: `File size must be less than ${maxSizeInMB}MB` };
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { isValid: false, error: 'Invalid file type. Please upload an image file (jpg, png, gif, bmp, webp)' };
    }

    return { isValid: true };
  };
}

// Export singleton instance
export const imageService = new ImageService();
export default imageService;
