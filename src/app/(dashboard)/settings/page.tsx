'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from '@/services/mockData';
import { authService } from '@/services/authService';
import { Profile } from '@/types';
import { 
  User, 
  Database, 
  RefreshCw, 
  Moon, 
  Sun, 
  Check, 
  AlertCircle, 
  Key,
  ShieldCheck,
  Users,
  Search,
  UserCheck,
  UserX
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isDemoMode } = useAuth();
  
  // Estado local para el tema del CRM
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Estado local para Google Drive
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Estado local para Administración de Usuarios (Operadores)
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Detectar el tema actual del elemento html
    if (typeof window !== 'undefined') {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');

      // Cargar credenciales de Google
      setGoogleClientId(localStorage.getItem('okanpro_gauth_client_id') || '');
      setGoogleApiKey(localStorage.getItem('okanpro_gauth_api_key') || '');
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'administrador') {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const data = await authService.getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error cargando perfiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleToggleActive = async (profileId: string, currentStatus: boolean) => {
    if (profileId === user?.id) {
      alert('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }
    try {
      await authService.updateProfile(profileId, { activo: !currentStatus });
      loadProfiles();
    } catch (err: any) {
      console.error(err);
      alert('Error al cambiar el estado del usuario: ' + err.message);
    }
  };

  const handleToggleRole = async (profileId: string, currentRole: string) => {
    if (profileId === user?.id) {
      alert('No puedes cambiar tu propio rol de administrador.');
      return;
    }
    const newRole = currentRole === 'administrador' ? 'vendedor' : 'administrador';
    try {
      await authService.updateProfile(profileId, { role: newRole });
      loadProfiles();
    } catch (err: any) {
      console.error(err);
      alert('Error al cambiar el rol del usuario: ' + err.message);
    }
  };

  const handleSaveGoogleConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('okanpro_gauth_client_id', googleClientId.trim());
      localStorage.setItem('okanpro_gauth_api_key', googleApiKey.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleToggleTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (newTheme === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
      } else {
        html.classList.remove('light');
        html.classList.add('dark');
      }
      setTheme(newTheme);
    }
  };

  const handleResetData = () => {
    if (!confirm('¿Estás seguro de que deseas reiniciar todos los datos locales? Se perderán las modificaciones y regresarán los prospectos y tareas de prueba iniciales.')) return;
    
    mockDb.reset();
    alert('Datos reiniciados correctamente. La página se recargará ahora.');
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-8 animate-fade-in">
        
        {/* Profile Card Section */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Perfil de Operador</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Información sobre tu cuenta y permisos asignados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nombre Completo</span>
              <p className="font-bold text-foreground p-3 rounded-xl bg-secondary/35 border border-border/50">{user?.full_name || 'Usuario Demo'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Correo Electrónico</span>
              <p className="font-bold text-foreground p-3 rounded-xl bg-secondary/35 border border-border/50">{user?.email}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rol de Acceso</span>
              <p className="font-bold text-foreground p-3 rounded-xl bg-secondary/35 border border-border/50 capitalize flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                {user?.role || 'vendedor'}
              </p>
            </div>
          </div>
        </div>

        {/* User Management Section (Only visible to Admin) */}
        {user?.role === 'administrador' && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Gestión de Operadores</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Autoriza el acceso de los vendedores y configura sus permisos.</p>
                </div>
              </div>
              
              <button 
                onClick={loadProfiles}
                disabled={loadingProfiles}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
                title="Actualizar Lista"
              >
                <RefreshCw size={16} className={loadingProfiles ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Buscador de usuarios */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar operador por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Listado de perfiles */}
            <div className="divide-y divide-border/60">
              {loadingProfiles ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-primary animate-spin" />
                  Cargando operadores registrados...
                </div>
              ) : profiles.filter(p => 
                p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No se encontraron operadores registrados.
                </div>
              ) : (
                profiles.filter(p => 
                  p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(profile => (
                  <div key={profile.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white select-none ${
                        profile.role === 'administrador' ? 'bg-primary' : 'bg-slate-500'
                      }`}>
                        {(profile.full_name || '?')[0].toUpperCase()}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground line-clamp-1 leading-snug">{profile.full_name || 'Nuevo Operador'}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold capitalize ${
                            profile.role === 'administrador' 
                              ? 'bg-primary/10 text-primary border border-primary/10' 
                              : 'bg-secondary text-muted-foreground border border-border'
                          }`}>
                            {profile.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{profile.email}</p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {/* Alternar Rol */}
                      <button
                        onClick={() => handleToggleRole(profile.id, profile.role)}
                        disabled={profile.id === user?.id}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          profile.role === 'administrador'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                            : 'bg-background text-foreground border-border hover:bg-secondary'
                        }`}
                        title="Cambiar Rol de Permisos"
                      >
                        Hacer {profile.role === 'administrador' ? 'Vendedor' : 'Admin'}
                      </button>

                      {/* Alternar Estado Activo */}
                      <button
                        onClick={() => handleToggleActive(profile.id, !!profile.activo)}
                        disabled={profile.id === user?.id}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                          profile.activo
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                        }`}
                      >
                        {profile.activo ? <UserCheck size={11} /> : <UserX size={11} />}
                        {profile.activo ? 'Activo' : 'Pendiente'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Theme Settings Section */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
              {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Personalización Visual</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ajusta la apariencia visual del CRM según tu preferencia.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleToggleTheme('dark')}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'border-primary bg-primary/5 text-foreground font-bold shadow-sm' 
                  : 'border-border bg-background/50 hover:bg-secondary/40 text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-primary" />
                <span className="text-xs">Modo Oscuro (Premium)</span>
              </div>
              {theme === 'dark' && <Check size={16} className="text-primary" />}
            </button>

            <button
              onClick={() => handleToggleTheme('light')}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'border-primary bg-primary/5 text-foreground font-bold shadow-sm' 
                  : 'border-border bg-background/50 hover:bg-secondary/40 text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun size={18} className="text-amber-500" />
                <span className="text-xs">Modo Claro (Estándar)</span>
              </div>
              {theme === 'light' && <Check size={16} className="text-primary" />}
            </button>
          </div>
        </div>

        {/* Google Drive Integration Section */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 shrink-0">
              <Key size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Integración de Google Drive</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configura tus credenciales para vincular archivos de Google Drive directamente.</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Google Client ID (OAuth)</label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="ej. 123456-abcdef.apps.googleusercontent.com"
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Google API Key (Developer Key)</label>
                <input
                  type="password"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder="ej. AIzaSyA1..."
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-[11px] text-muted-foreground max-w-md">
                {!googleClientId || !googleApiKey ? (
                  <span className="text-amber-500 font-medium flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" />
                    Modo Simulador activo. Deja estos campos vacíos para usar archivos de prueba.
                  </span>
                ) : (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <Check size={12} className="shrink-0" />
                    Credenciales configuradas. Integración en tiempo real activa.
                  </span>
                )}
              </div>
              
              <button
                onClick={handleSaveGoogleConfig}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSaved ? <Check size={14} /> : null}
                {isSaved ? 'Guardado' : 'Guardar Credenciales'}
              </button>
            </div>
          </div>
        </div>

        {/* Connection status Section */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Base de Datos & Sincronización</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Estado de la conexión entre el CRM de OkanPro y Supabase.</p>
            </div>
          </div>

          {/* Connection Status Panel */}
          {isDemoMode ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400">Ejecutando en Modo Demo</h4>
                  <p className="text-[11px] text-amber-500/95 leading-relaxed mt-1">
                    No hemos detectado las variables de entorno de Supabase. El CRM está guardando todos los prospectos,
                    oportunidades, cotizaciones y notas localmente en el almacenamiento de tu navegador.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="pt-2 border-t border-amber-500/10 text-[10px] space-y-2 text-amber-500/90 font-medium">
                <p>Para conectar tu base de datos de producción, añade lo siguiente a tu archivo <code className="px-1.5 py-0.5 rounded bg-background/50 text-amber-200">.env.local</code>:</p>
                <pre className="p-3 rounded-lg bg-background/70 font-mono text-[9px] text-amber-200/90 overflow-x-auto select-all leading-normal">
{`NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-400">Sincronización en la Nube Activa</h4>
                <p className="text-[11px] text-emerald-500/95 leading-relaxed mt-1">
                  ¡Excelente! El CRM está conectado a tu proyecto de Supabase en producción. Todas las transacciones
                  y modificaciones se guardan y leen en la nube de forma segura y en tiempo real.
                </p>
              </div>
            </div>
          )}

          {/* Local testing options */}
          {isDemoMode && (
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-foreground">Restablecer base de datos local</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Limpia y carga los prospectos y tareas de prueba iniciales en tu almacenamiento local.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive hover:bg-destructive/10 text-destructive font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw size={13} />
                Reiniciar Datos Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
