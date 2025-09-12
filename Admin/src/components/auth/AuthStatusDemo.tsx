// Demo component showing how to use authentication in components
// This is for reference and can be removed in production

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Shield } from 'lucide-react';
import TokenManager from '@/utils/tokenManager';

export const AuthStatusDemo: React.FC = () => {
    const { user, isAuthenticated, token, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const getTokenInfo = () => {
        const tokenExpiration = TokenManager.getTokenExpiration();
        const timeUntilExpiration = TokenManager.getTimeUntilExpiration();
        const isExpiringSoon = TokenManager.isTokenExpiringSoon();

        return {
            expiresAt: tokenExpiration,
            timeUntilExpiration: Math.floor(timeUntilExpiration / (1000 * 60)), // minutes
            isExpiringSoon,
        };
    };

    const tokenInfo = getTokenInfo();

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Authentication Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={isAuthenticated ? "default" : "destructive"}>
                        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                </div>

                {/* User Information */}
                {isAuthenticated && user && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">User Info:</span>
                            </div>
                            <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                                <div>ID: {user.id}</div>
                                <div>Email: {user.email}</div>
                                {user.name && <div>Name: {user.name}</div>}
                            </div>
                        </div>

                        {/* Token Information */}
                        <div className="space-y-2">
                            <span className="text-sm font-medium">Token Info:</span>
                            <div className="ml-0 space-y-1 text-xs text-muted-foreground">
                                <div>
                                    Expires in: {tokenInfo.timeUntilExpiration} minutes
                                    {tokenInfo.isExpiringSoon && (
                                        <Badge variant="destructive" className="ml-2 text-xs">
                                            Expiring Soon
                                        </Badge>
                                    )}
                                </div>
                                <div className="font-mono text-xs bg-muted p-1 rounded">
                                    {token?.substring(0, 20)}...
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleLogout}
                            className="w-full"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </>
                )}

                {/* Usage Instructions */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                        <strong>Usage in Components:</strong><br />
                        1. Import: <code>useAuth</code> hook<br />
                        2. Access: <code>user, isAuthenticated, token, login, logout</code><br />
                        3. Token automatically included in API requests via services
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default AuthStatusDemo;
