import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { authApi } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthContext: Starting auth initialization', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 10) + '...' : 'none',
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      if (token) {
        console.log('🔑 AuthContext: Token found, validating with /auth/me');
        try {
          const response = await authApi.me();
          console.log('✅ AuthContext: /auth/me response received', {
            success: response.data.success,
            hasUserData: !!response.data.data,
            userData: response.data.data,
            timestamp: new Date().toISOString()
          });

          if (response.data.success) {
            setUser(response.data.data);
            console.log('👤 AuthContext: User set successfully');
          } else {
            console.log('❌ AuthContext: Auth validation failed - removing token');
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } catch (error: any) {
          console.error('❌ AuthContext: Auth initialization error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            isTokenExpired: error.response?.data?.error?.includes('expired'),
            timestamp: new Date().toISOString()
          });
          console.log('🗑️ AuthContext: Removing invalid token');
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      } else {
        console.log('🚫 AuthContext: No token found, user will remain null');
      }
      
      console.log('✅ AuthContext: Initialization complete, setting loading to false');
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('auth_token', newToken);
        toast.success('Login successful!');
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};