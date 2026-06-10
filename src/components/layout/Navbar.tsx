'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Sparkles, Database, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const pathname = usePathname();
  const { isDemoMode, user, simulatedRole, setSimulatedRole } = useAuth();

  // Obtener el título dinámico según la ruta
  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Panel de Control (Dashboard)';
      case '/leads': return 'Prospectos y Clientes';
      case '/pipeline': return 'Pipeline de Ventas';
      case '/tasks': return 'Gestión de Tareas';
      case '/manuals': return 'Manuales y Documentación';
      case '/settings': return 'Configuración del Sistema';
      default: return 'OkanPro CRM';
    }
  };

  return (
    <header className="sticky top-0 z-10 flex flex-col w-full bg-background/80 backdrop-blur-md border-b border-border">
      {/* Demo Mode Alert Banner */}
      {isDemoMode && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs font-medium text-center">
          <Database size={13} className="shrink-0 animate-pulse" />
          <span>
            <strong>Modo Demo Local:</strong> Los datos se guardan en el navegador. Conecta Supabase en el archivo <code className="px-1 py-0.5 rounded bg-background/50 text-amber-200">.env.local</code> para habilitar la sincronización en la nube.
          </span>
        </div>
      )}

      {/* Sandbox Warning Banner */}
      {simulatedRole && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-sky-500/20 via-sky-600/20 to-sky-500/20 border-b border-sky-500/30 text-sky-300 text-xs font-medium text-center">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          <span className="flex items-center gap-2 flex-wrap justify-center">
            <span>
              <strong>Modo Sandbox Activo:</strong> Estás simulando la vista de un <strong>{simulatedRole === 'vendedor' ? 'Vendedor' : simulatedRole}</strong>.
            </span>
            <button 
              onClick={() => setSimulatedRole(null)} 
              className="px-2 py-0.5 bg-sky-500/30 hover:bg-sky-500/50 text-sky-100 rounded text-[10px] font-bold transition-colors cursor-pointer border border-sky-500/40"
            >
              Volver a Admin
            </button>
          </span>
        </div>
      )}

      {/* Main Header Area */}
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Side Icons & Profile */}
        <div className="flex items-center gap-4">
          {/* Demo Mode Badge */}
          {isDemoMode ? (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles size={12} />
              Demo
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert size={12} />
              Conectado
            </span>
          )}

          {/* User Initials Circle */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold leading-none text-foreground">{user?.full_name || 'Demo'}</span>
              <span className="text-[10px] text-muted-foreground capitalize leading-normal">
                {user?.role || 'vendedor'} {simulatedRole && <span className="text-sky-400 font-bold">(Simulado)</span>}
              </span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white text-xs font-bold shadow-sm select-none">
              {user?.full_name?.substring(0, 2).toUpperCase() || 'DM'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
