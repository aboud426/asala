// Token Management Utility using Cookies
// Provides secure token storage with automatic expiration handling

export interface AuthData {
    token: string;
    expiresAt: string;
    user: any; // Replace with your UserDto type
}

export class TokenManager {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly EXPIRES_KEY = 'auth_expires_at';
    private static readonly USER_KEY = 'user_data';

    /**
     * Set a cookie with optional expiration
     */
    private static setCookie(name: string, value: string, expiresAt?: string): void {
        let cookieString = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict; Secure`;

        if (expiresAt) {
            cookieString += `; expires=${new Date(expiresAt).toUTCString()}`;
        }

        document.cookie = cookieString;
    }

    /**
     * Get a cookie value by name
     */
    private static getCookie(name: string): string | null {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    /**
     * Delete a cookie by name
     */
    private static deleteCookie(name: string): void {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure`;
    }

    /**
     * Store authentication data in cookies
     */
    static setAuthData(authData: AuthData): void {
        try {
            this.setCookie(this.TOKEN_KEY, authData.token, authData.expiresAt);
            this.setCookie(this.EXPIRES_KEY, authData.expiresAt, authData.expiresAt);
            this.setCookie(this.USER_KEY, JSON.stringify(authData.user), authData.expiresAt);
        } catch (error) {
            console.error('Failed to store authentication data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Get stored authentication token
     */
    static getToken(): string | null {
        return this.getCookie(this.TOKEN_KEY);
    }

    /**
     * Get token expiration date
     */
    static getTokenExpiration(): string | null {
        return this.getCookie(this.EXPIRES_KEY);
    }

    /**
     * Get stored user data
     */
    static getUserData(): any | null {
        const userData = this.getCookie(this.USER_KEY);
        console.log('userData', userData);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Failed to parse user data:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated (token exists and not expired)
     */
    static isAuthenticated(): boolean {
        const token = this.getToken();
        const expiresAt = this.getTokenExpiration();

        if (!token || !expiresAt) {
            return false;
        }

        // Check if token is expired
        const expiryDate = new Date(expiresAt);
        const now = new Date();

        if (now >= expiryDate) {
            // Token expired, clear cookies
            this.clearAuthData();
            return false;
        }

        return true;
    }

    /**
     * Clear all authentication data from cookies
     */
    static clearAuthData(): void {
        this.deleteCookie(this.TOKEN_KEY);
        this.deleteCookie(this.EXPIRES_KEY);
        this.deleteCookie(this.USER_KEY);
    }

    /**
     * Get authorization header for API requests
     */
    static getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Check if token will expire soon (within 5 minutes)
     */
    static isTokenExpiringSoon(): boolean {
        const expiresAt = this.getTokenExpiration();
        if (!expiresAt) return false;

        const expiryDate = new Date(expiresAt);
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

        return expiryDate <= fiveMinutesFromNow;
    }

    /**
     * Get time until token expires in milliseconds
     */
    static getTimeUntilExpiration(): number {
        const expiresAt = this.getTokenExpiration();
        if (!expiresAt) return 0;

        const expiryDate = new Date(expiresAt);
        const now = new Date();

        return Math.max(0, expiryDate.getTime() - now.getTime());
    }
}

export default TokenManager;
