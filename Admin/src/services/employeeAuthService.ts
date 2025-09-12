// Employee Authentication API Service
// Based on the EmployeeAuthController API endpoints

import TokenManager from '@/utils/tokenManager';
import type { UserDto } from '@/types/auth';

export interface LoginDto {
    email: string;
    password: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    user: UserDto;
    token: string;
    expiresAt: string; // ISO date string
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    messageCode: string;
    data?: T;
}

class EmployeeAuthService {
    private readonly baseUrl = '/api/auth/employee';

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
            console.error('Employee Auth API Request Error:', error);
            throw error;
        }
    };

    /**
     * Authenticate employee using email and password
     * POST /api/auth/employee/login
     */
    login = async (loginData: LoginDto): Promise<AuthResponse> => {
        const response = await this.request<AuthResponse>('/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
        });

        if (!response.success) {
            throw new Error(response.message || 'Login failed');
        }

        if (!response.data) {
            throw new Error('No authentication data returned from server');
        }

        // Store the token in cookies for future requests
        TokenManager.setAuthData(response.data);

        return response.data;
    };

    /**
     * Logout employee (invalidates the current session)
     * POST /api/auth/employee/logout
     */
    logout = async (): Promise<void> => {
        const response = await this.request<void>('/logout', {
            method: 'POST',
        });

        if (!response.success) {
            throw new Error(response.message || 'Logout failed');
        }

        // Clear stored authentication data
        TokenManager.clearAuthData();
    };

    /**
     * Change employee password
     * PUT /api/auth/employee/{userId}/change-password
     */
    changePassword = async (userId: number, passwordData: ChangePasswordDto): Promise<void> => {
        const response = await this.request<void>(`/${userId}/change-password`, {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to change password');
        }
    };

    /**
     * Validate employee password
     * POST /api/auth/employee/{userId}/validate-password
     */
    validatePassword = async (userId: number, password: string): Promise<void> => {
        const response = await this.request<void>(`/${userId}/validate-password`, {
            method: 'POST',
            body: JSON.stringify(password),
        });

        if (!response.success) {
            throw new Error(response.message || 'Password validation failed');
        }
    };

    /**
     * Get stored authentication token
     */
    getToken = (): string | null => {
        return TokenManager.getToken();
    };

    /**
     * Get stored user data
     */
    getUserData = (): UserDto | null => {
        return TokenManager.getUserData();
    };

    /**
     * Check if user is authenticated
     */
    isAuthenticated = (): boolean => {
        return TokenManager.isAuthenticated();
    };

    /**
     * Get authorization header for API requests
     */
    getAuthHeaders = (): Record<string, string> => {
        return TokenManager.getAuthHeaders();
    };
}

// Export singleton instance
export const employeeAuthService = new EmployeeAuthService();
export default employeeAuthService;
