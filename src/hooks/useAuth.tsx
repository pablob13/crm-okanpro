'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Profile, UserRole } from '@/types';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  realUser: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isDemoMode = !isSupabaseConfigured;

  // Cargar rol simulado desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('okanpro_simulated_role');
      if (saved === 'administrador' || saved === 'vendedor') {
        setSimulatedRoleState(saved as UserRole);
      }
    }
  }, []);

  const setSimulatedRole = (role: UserRole | null) => {
    setSimulatedRoleState(role);
    if (typeof window !== 'undefined') {
      if (role) {
        localStorage.setItem('okanpro_simulated_role', role);
      } else {
        localStorage.removeItem('okanpro_simulated_role');
      }
    }
  };

  // Perfil calculado para toda la aplicación con override de rol si está simulado
  const computedUser = user ? {
    ...user,
    role: simulatedRole || user.role
  } : null;

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && currentUser.activo === false) {
          await authService.logout();
          setUser(null);
          router.push('/login?error=inactive');
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

    if (!computedUser && !isAuthRoute && !isPublicRoute) {
      router.push('/login');
    } else if (computedUser && isAuthRoute) {
      router.push('/');
    }
  }, [computedUser, loading, pathname, router]);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      setSimulatedRole(null); // Reiniciar simulación al loguearse
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
        router.push('/login?registered=true');
      } else {
        setUser(newUser);
        setSimulatedRole(null); // Reiniciar simulación al registrarse
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
      setSimulatedRole(null); // Limpiar simulación
      router.push('/login');
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: computedUser, 
      realUser: user, 
      loading, 
      isDemoMode, 
      login, 
      signup, 
      logout,
      simulatedRole,
      setSimulatedRole
    }}>
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
