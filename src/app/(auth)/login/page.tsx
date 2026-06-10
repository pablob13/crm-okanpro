'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Mail, Lock, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginPageContent() {
  const { login, isDemoMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const registeredParam = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (errorParam || registeredParam) {
      setShowModal(true);
    }
  }, [errorParam, registeredParam]);

  const handleCloseModal = () => {
    setShowModal(false);
    router.replace('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('demo@okanpro.com', 'demopassword');
    } catch (err: any) {
      console.error(err);
      setError('Error al acceder en modo demo.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background Orbs / Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Glass card container */}
      <div className="relative w-full max-w-md p-8 rounded-2xl glass shadow-2xl border border-border animate-fade-in">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="OkanPro Logo" 
            className="w-16 h-16 object-contain rounded-xl shadow-md mb-3"
          />
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Okan<span className="text-primary font-extrabold">Pro</span> CRM
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            Gestión inteligente de clientes y oportunidades comerciales
          </p>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@okanpro.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all-custom"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required={!isDemoMode}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all-custom"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 transition-all-custom cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2.5 text-muted-foreground text-[10px] tracking-wider font-semibold">O también</span>
          </div>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all-custom cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={16} className="text-amber-400" />
          {isDemoMode ? 'Acceder en Modo Demo' : 'Acceso Rápido Demo'}
        </button>

        {/* Demo Indicator Footer */}
        {isDemoMode && (
          <div className="mt-6 flex justify-center gap-1.5 items-center text-amber-500/80 text-[10px] font-medium">
            <Database size={11} />
            <span>Supabase desconectado. Entrando en base local temporal.</span>
          </div>
        )}

        {/* Link to Register */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* Custom Modal with OkanPro Branding */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up">
            
            {/* Branding Logo */}
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="OkanPro Logo" 
                className="w-16 h-16 object-contain rounded-xl shadow-md"
              />
              <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-background border border-border rounded-lg shadow-sm">
                {registeredParam ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={16} className="text-amber-500" />
                )}
              </div>
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-foreground">
                {registeredParam ? '¡Registro Exitoso!' : 'Cuenta en Revisión'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {registeredParam 
                  ? 'Tu cuenta ha sido creada correctamente y está pendiente de aprobación por un administrador. Recibirás acceso completo una vez que sea autorizada.'
                  : 'Tu cuenta de operador está pendiente de aprobación. Comunícate con un administrador o envía un correo a soporte@okanpro.com.'}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={handleCloseModal}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
