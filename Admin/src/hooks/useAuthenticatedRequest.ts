// Custom hook for making authenticated API requests
// Automatically includes auth headers and handles token expiration

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TokenManager from '@/utils/tokenManager';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean; // Skip adding auth headers (for public endpoints)
}

export const useAuthenticatedRequest = () => {
    const { logout } = useAuth();

    const makeRequest = useCallback(async <T>(
        url: string,
        options: RequestOptions = {}
    ): Promise<T> => {
        const { skipAuth = false, ...requestOptions } = options;

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        // Add authentication headers if not skipped
        if (!skipAuth) {
            const authHeaders = TokenManager.getAuthHeaders();
            Object.assign(headers, authHeaders);
        }

        const requestConfig: RequestInit = {
            ...requestOptions,
            headers,
        };

        try {
            const response = await fetch(url, requestConfig);

            // Handle authentication errors
            if (response.status === 401) {
                // Token might be expired or invalid
                console.warn('Authentication failed - logging out user');
                logout();
                throw new Error('Authentication failed. Please login again.');
            }

            // Handle other HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse JSON response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            // Return response as text if not JSON
            return await response.text() as unknown as T;
        } catch (error) {
            console.error('Authenticated request failed:', error);
            throw error;
        }
    }, [logout]);

    const get = useCallback(<T>(url: string, options?: RequestOptions) =>
        makeRequest<T>(url, { ...options, method: 'GET' }), [makeRequest]);

    const post = useCallback(<T>(url: string, data?: any, options?: RequestOptions) =>
        makeRequest<T>(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }), [makeRequest]);

    const put = useCallback(<T>(url: string, data?: any, options?: RequestOptions) =>
        makeRequest<T>(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }), [makeRequest]);

    const del = useCallback(<T>(url: string, options?: RequestOptions) =>
        makeRequest<T>(url, { ...options, method: 'DELETE' }), [makeRequest]);

    return {
        request: makeRequest,
        get,
        post,
        put,
        delete: del,
    };
};

export default useAuthenticatedRequest;
