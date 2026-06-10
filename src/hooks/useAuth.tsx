'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Profile } from '@/types';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && currentUser.activo === false) {
          await authService.logout();
          setUser(null);
          alert('Tu cuenta está pendiente de aprobación por un administrador. Comunícate con soporte@okanpro.com.');
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error inicializando autenticación:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Redirección basada en el estado de autenticación
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isPublicRoute = pathname.startsWith('/manuals/share/');

    if (!user && !isAuthRoute && !isPublicRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      router.push('/');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password?: string, fullName?: string) => {
    setLoading(true);
    try {
      const newUser = await authService.signup(email, password, fullName);
      if (newUser && newUser.activo === false) {
        await authService.logout();
        setUser(null);
        alert('¡Registro exitoso! Tu cuenta ha sido creada y está pendiente de aprobación por un administrador.');
        router.push('/login');
      } else {
        setUser(newUser);
        router.push('/');
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
