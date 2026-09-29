import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSafe } from '@shared/types/index.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: UserSafe | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSafe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.get<{ user: UserSafe }>('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await api.post<{ user: UserSafe }>('/api/auth/sign-in', { email, password });
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const data = await api.post<{ user: UserSafe }>('/api/auth/sign-up', {
      email,
      password,
      display_name: displayName,
    });
    setUser(data.user);
  };

  const demoLogin = async () => {
    const data = await api.post<{ user: UserSafe }>('/api/auth/demo');
    setUser(data.user);
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/sign-out');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        demoLogin,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
