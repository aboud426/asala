import { DashboardStatsDto, ApiResponse } from '@/types/dashboard';
import TokenManager from '@/utils/tokenManager';

class DashboardService {
    private readonly baseUrl = '/api/dashboard';

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
            console.error('Dashboard API Request Error:', error);
            throw error;
        }
    };

    /**
     * Get dashboard statistics and analytics data
     * GET /api/dashboard/stats
     */
    getStats = async (): Promise<DashboardStatsDto> => {
        const response = await this.request<DashboardStatsDto>('/stats', {
            method: 'GET',
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch dashboard stats');
        }

        if (!response.data) {
            throw new Error('No data returned from server');
        }

        return response.data;
    };
}

// Export singleton instance
export const dashboardService = new DashboardService();
