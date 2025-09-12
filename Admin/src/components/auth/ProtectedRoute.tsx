import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * ProtectedRoute component that guards routes requiring authentication
 * Redirects to login page if user is not authenticated
 * Shows loading spinner while checking authentication status
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    fallback = null 
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Checking authentication...
                        </p>
                    </div>
                </div>
            )
        );
    }

    // Redirect to login if not authenticated, preserving the intended destination
    if (!isAuthenticated) {
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // Render protected content if authenticated
    return <>{children}</>;
};

interface PublicRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * PublicRoute component for routes that should redirect authenticated users
 * Useful for login/register pages
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ 
    children, 
    redirectTo = '/' 
}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // Redirect authenticated users away from public routes (like login)
    if (isAuthenticated) {
        // Check if there's a redirect destination in state
        const from = (location.state as any)?.from?.pathname || redirectTo;
        return <Navigate to={from} replace />;
    }

    // Render public content for unauthenticated users
    return <>{children}</>;
};

export default ProtectedRoute;
