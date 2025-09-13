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
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            localStorage.removeItem('auth_token');
            setToken(null);
          }
        } catch (error: any) {
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      
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