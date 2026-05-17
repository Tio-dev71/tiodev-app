'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_SUBSCRIPTION_API || 'https://api.tiodev.io.vn/v1';

export interface SubUser {
  id: string;
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  planCode: string;
  planName: string;
  status: string;
  cycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  licenseKey?: string;
}

interface AuthContextType {
  user: SubUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SubUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sub_token');
    const savedUser = localStorage.getItem('sub_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sub_token');
        localStorage.removeItem('sub_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Đăng nhập thất bại' };
      }

      const accessToken = data.accessToken;
      localStorage.setItem('sub_token', accessToken);
      localStorage.setItem('sub_user', JSON.stringify(data.user));
      setToken(accessToken);
      setUser(data.user);

      return { success: true };
    } catch {
      return { success: false, message: 'Không thể kết nối server' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Đăng ký thất bại' };
      }

      const accessToken = data.accessToken;
      localStorage.setItem('sub_token', accessToken);
      localStorage.setItem('sub_user', JSON.stringify(data.user));
      setToken(accessToken);
      setUser(data.user);

      return { success: true };
    } catch {
      return { success: false, message: 'Không thể kết nối server' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sub_token');
    localStorage.removeItem('sub_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  }), [user, token, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
