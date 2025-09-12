// Employee Authentication API Service
// Based on the EmployeeAuthController API endpoints

export interface LoginDto {
    email: string;
    password: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UserDto {
    id: number;
    email: string;
    // Add other user properties as needed based on your user model
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

        // Store the token in localStorage for future requests
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('auth_expires_at', response.data.expiresAt);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));

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
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_expires_at');
        localStorage.removeItem('user_data');
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
        return localStorage.getItem('auth_token');
    };

    /**
     * Get stored user data
     */
    getUserData = (): UserDto | null => {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    };

    /**
     * Check if user is authenticated
     */
    isAuthenticated = (): boolean => {
        const token = this.getToken();
        const expiresAt = localStorage.getItem('auth_expires_at');
        
        if (!token || !expiresAt) {
            return false;
        }

        // Check if token is expired
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        
        if (now >= expiryDate) {
            // Token expired, clear storage
            this.logout();
            return false;
        }

        return true;
    };

    /**
     * Get authorization header for API requests
     */
    getAuthHeaders = (): Record<string, string> => {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
}

// Export singleton instance
export const employeeAuthService = new EmployeeAuthService();
export default employeeAuthService;
