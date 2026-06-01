'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  githubUsername?: string;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: 'light' | 'dark';
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Dark mode by default for that premium feel
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Fetch current user session
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.status !== 'error') {
        setUser(data.user);
      } else {
        // If access token expired, try to silently refresh
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        const refreshData = await refreshResponse.json();
        
        if (refreshResponse.ok && refreshData.status !== 'error') {
          setUser(refreshData.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setUser(data.user);
        showToast('Successfully logged in!', 'success');
        return { success: true, message: data.message };
      } else {
        showToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('An unexpected network error occurred', 'error');
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setUser(data.user);
        showToast('Account created successfully!', 'success');
        return { success: true, message: data.message };
      } else {
        showToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      showToast('An unexpected network error occurred', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      showToast('Logout failed', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toasts,
        showToast,
        removeToast,
        login,
        register,
        logout,
        toggleTheme,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
