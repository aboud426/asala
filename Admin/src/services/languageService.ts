// Language API Service
// Based on the API documentation for language endpoints

export interface Language {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLanguageDto {
    name: string;
    code: string;
}

export interface UpdateLanguageDto {
    name: string;
    code: string;
    isActive: boolean;
}

export interface LanguageDropdownDto {
    id: number;
    name: string;
    code: string;
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

class LanguageService {
    private readonly baseUrl = '/api/languages';

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
     * Get paginated list of languages
     * GET /api/languages
     */
    getLanguages = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<Language>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Language>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch languages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Get languages for dropdown/select components
     * GET /api/languages/dropdown
     */
    getLanguagesDropdown = async (): Promise<LanguageDropdownDto[]> => {
        const response = await this.request<LanguageDropdownDto[]>('/dropdown');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch languages dropdown');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new language
     * POST /api/languages
     */
    createLanguage = async (data: CreateLanguageDto): Promise<Language> => {
        const response = await this.request<Language>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create language');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing language
     * PUT /api/languages/{id}
     */
    updateLanguage = async (id: number, data: UpdateLanguageDto): Promise<Language> => {
        const response = await this.request<Language>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update language');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle language activation status
     * PUT /api/languages/{id}/toggle-activation
     */
    toggleLanguageActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle language activation');
        }
    };

    /**
     * Delete a language (soft delete)
     * DELETE /api/languages/{id}
     */
    deleteLanguage = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete language');
        }
    };
}

// Export singleton instance
export const languageService = new LanguageService();
export default languageService;
