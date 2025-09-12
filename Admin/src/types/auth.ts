// Authentication types shared across the application

export interface UserDto {
    id: number;
    name: string;
    email: string;
    // Add other user properties as needed based on your user model
}

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserDto | null;
    token: string | null;
    login: (authData: { token: string; expiresAt: string; user: UserDto }) => void;
    logout: () => void;
    checkAuth: () => boolean;
}
