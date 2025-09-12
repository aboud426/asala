import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenManager from '@/utils/tokenManager';
import type { UserDto, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserDto | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check authentication status on mount and set up auto-refresh
    useEffect(() => {
        const checkAuth = () => {
            try {
                const isAuth = TokenManager.isAuthenticated();
                const userData = TokenManager.getUserData();
                const authToken = TokenManager.getToken();

                setIsAuthenticated(isAuth);
                setUser(isAuth ? userData : null);
                setToken(isAuth ? authToken : null);

                // If not authenticated and we're not on the login page, redirect
                if (!isAuth && window.location.pathname !== '/login') {
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Set up an interval to check token expiration every minute
        const interval = setInterval(checkAuth, 60000);

        return () => clearInterval(interval);
    }, [navigate]);


    const login = (authData: { token: string; expiresAt: string; user: UserDto }) => {
        try {
            // Store in cookies
            TokenManager.setAuthData(authData);

            // Update state
            setIsAuthenticated(true);
            setUser(authData.user);
            setToken(authData.token);

            console.log('User logged in successfully');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            // Clear cookies
            TokenManager.clearAuthData();

            // Update state
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);

            // Redirect to login
            navigate('/login', { replace: true });

            console.log('User logged out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const checkAuth = (): boolean => {
        return TokenManager.isAuthenticated();
    };

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
