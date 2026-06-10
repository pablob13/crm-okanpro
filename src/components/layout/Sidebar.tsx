'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  CheckSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Shield,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, realUser, simulatedRole, setSimulatedRole, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Prospectos (Leads)', href: '/leads', icon: Users },
    { name: 'Pipeline de Ventas', href: '/pipeline', icon: Kanban },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare },
    { name: 'Manuales y Docs', href: '/manuals', icon: BookOpen },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground transition-all-custom">
      {/* Logo Area */}
      <div className="flex items-center justify-between p-6 border-b border-border h-16">
        <Link href="/" className="flex items-center gap-3">
          {/* Real Logo for OkanPro */}
          <img 
            src="/logo.png" 
            alt="OkanPro Logo" 
            className="w-8 h-8 object-contain rounded-lg shadow-sm"
          />
          {!collapsed && (
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Okan<span className="text-primary font-bold">Pro</span>
            </span>
          )}
        </Link>
        
        {/* Collapse Toggle Button (Desktop Only) */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all-custom group cursor-pointer ${
                isActive 
                  ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground transition-colors'} />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sandbox Selector for Admins */}
      {realUser?.role === 'administrador' && (
        !collapsed ? (
          <div className="px-6 py-4 border-t border-border bg-sky-500/5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  Sandbox
                </span>
                {simulatedRole && (
                  <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold font-mono">
                    SIMULANDO
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-sky-500/20 hover:border-sky-500/40 transition-colors">
                <span className="text-xs text-foreground font-medium">Simular Vendedor</span>
                <button
                  type="button"
                  onClick={() => setSimulatedRole(simulatedRole === 'vendedor' ? null : 'vendedor')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    simulatedRole === 'vendedor' ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                  aria-label="Alternar modo sandbox"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      simulatedRole === 'vendedor' ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-border bg-sky-500/5 flex flex-col items-center justify-center">
            <button
              onClick={() => {
                setSimulatedRole(simulatedRole === 'vendedor' ? null : 'vendedor');
              }}
              title={simulatedRole ? "Sandbox: Simulado como Vendedor. Haz clic para volver a Administrador." : "Sandbox: Rol Real Admin. Haz clic para simular Vendedor."}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all-custom cursor-pointer ${
                simulatedRole 
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400' 
                  : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-sky-500/50'
              }`}
            >
              {simulatedRole === 'vendedor' ? <Briefcase size={18} /> : <Shield size={18} />}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            </button>
          </div>
        )
      )}

      {/* User Session Profile and Logout */}
      <div className="p-4 border-t border-border bg-background/50">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.full_name || 'Usuario Demo'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className={`hidden md:block h-screen sticky top-0 shrink-0 transition-all-custom z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible on mobile menu trigger) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar Drawer */}
          <div className="relative flex flex-col w-64 h-full animate-slide-in shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-44px] flex items-center justify-center p-2 rounded-lg bg-card text-foreground border border-border cursor-pointer"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
