'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from '@/services/mockData';
import { 
  User, 
  Database, 
  RefreshCw, 
  Moon, 
  Sun, 
  Check, 
  AlertCircle, 
  Key,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isDemoMode } = useAuth();
  
  // Estado local para el tema del CRM
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Estado local para Google Drive
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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
