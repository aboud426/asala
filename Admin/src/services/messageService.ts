// Message API Service
// Based on the API documentation for message endpoints

export interface MessageLocalizedDto {
    id: number;
    key: string;
    text: string;
    languageId: number;
    languageName: string;
    languageCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: number;
    key: string;
    defaultText: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    localizations: MessageLocalizedDto[];
}

export interface CreateMessageLocalizedDto {
    key: string;
    text: string;
    languageId: number;
}

export interface CreateMessageDto {
    key: string;
    defaultText: string;
    localizations: CreateMessageLocalizedDto[];
}

export interface UpdateMessageLocalizedDto {
    id?: number; // Optional (null for new translations)
    key: string;
    text: string;
    languageId: number;
    isActive?: boolean; // Optional (defaults to true)
}

export interface UpdateMessageDto {
    key: string;
    defaultText: string;
    isActive: boolean;
    localizations: UpdateMessageLocalizedDto[];
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

class MessageService {
    private readonly baseUrl = '/api/messages';

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
     * Get paginated list of messages
     * GET /api/messages
     */
    getMessages = async (params: {
        page?: number;
        pageSize?: number;
        activeOnly?: boolean;
    } = {}): Promise<PaginatedResult<Message>> => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());

        const endpoint = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const response = await this.request<PaginatedResult<Message>>(endpoint);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch messages');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Create a new message
     * POST /api/messages
     */
    createMessage = async (data: CreateMessageDto): Promise<Message> => {
        const response = await this.request<Message>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to create message');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Update an existing message
     * PUT /api/messages/{id}
     */
    updateMessage = async (id: number, data: UpdateMessageDto): Promise<Message> => {
        const response = await this.request<Message>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to update message');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };

    /**
     * Toggle message activation status
     * PUT /api/messages/{id}/toggle-activation
     */
    toggleMessageActivation = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}/toggle-activation`, {
            method: 'PUT',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to toggle message activation');
        }
    };

    /**
     * Delete a message (soft delete)
     * DELETE /api/messages/{id}
     */
    deleteMessage = async (id: number): Promise<void> => {
        const response = await this.request<void>(`/${id}`, {
            method: 'DELETE',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to delete message');
        }
    };

    /**
     * Get messages missing translations (returns message IDs)
     * GET /api/messages/missing-translations
     */
    getMessagesMissingTranslations = async (): Promise<number[]> => {
        const response = await this.request<number[]>('/missing-translations');

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch messages missing translations');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const messageService = new MessageService();
export default messageService;
