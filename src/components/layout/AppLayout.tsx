'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pantalla de carga estética
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute font-black text-xs text-primary">OP</div>
        </div>
        <p className="mt-4 text-xs font-medium tracking-wider text-muted-foreground animate-pulse">
          CARGANDO OKANPRO CRM...
        </p>
      </div>
    );
  }

  // Si no está autenticado, el hook useAuth redirigirá al login de forma automática,
  // por lo que no renderizamos el layout completo para evitar destellos de contenido.
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Sidebar de Navegación (Desktop y Mobile Drawer) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Barra superior de herramientas e información */}
        <Navbar setMobileOpen={setMobileOpen} />
        
        {/* Contenedor principal del módulo */}
        <main className="flex-1 p-6 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
