'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { manualsService } from '@/services/manualsService';
import { Manual } from '@/types';
import { 
  FileText, 
  ExternalLink, 
  Printer, 
  Calendar, 
  Tag, 
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

export default function PublicManualPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [manual, setManual] = useState<Manual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Por defecto, modo claro para la lectura de documentos

  useEffect(() => {
    if (id) {
      loadManual();
    }
  }, [id]);

  const loadManual = async () => {
    setLoading(true);
    try {
      const data = await manualsService.getManualById(id);
      setManual(data);
    } catch (err: any) {
      console.error('Error cargando manual público:', err);
      setError(err.message || 'No se pudo encontrar el manual solicitado.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wider text-muted-foreground animate-pulse uppercase">
          Cargando documento...
        </p>
      </div>
    );
  }

  if (error || !manual) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-2xl w-fit mx-auto">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Documento no disponible</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            El enlace que has introducido podría ser incorrecto, o el documento ha sido eliminado por el equipo de OkanPro.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all cursor-pointer"
          >
            Acceder al CRM
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(manual.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getCategoryStyle = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('instalaci')) return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (cat.includes('técnic') || cat.includes('tecnic')) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (cat.includes('presentaci')) return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (cat.includes('cotizaci')) return 'bg-violet-50 text-violet-700 border border-violet-100';
    if (cat.includes('desarrollo')) return 'bg-rose-50 text-rose-700 border border-rose-100';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  const docCode = `OP-DOC-${manual.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className={`min-h-screen pb-12 relative overflow-hidden transition-colors duration-300 ${
      isDarkTheme ? 'bg-[#030712]' : 'bg-[#f1f5f9]'
    }`}>
      {/* Efectos de fondo radiales decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Barra de acento de marca en el tope */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-sky-400 to-primary print:hidden" />

      {/* Estilo CSS local para asegurar la renderización idéntica al editor */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        .rich-editor-canvas {
          background-color: #ffffff !important;
          color: #334155 !important;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 0.875rem !important;
          line-height: 1.8 !important;
        }
        .rich-editor-canvas h1 {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif !important;
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          margin-top: 1.75rem !important;
          margin-bottom: 0.75rem !important;
          padding-left: 0.75rem !important;
          border-left: 4px solid #0284c7 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
          color: #0f172a !important;
          letter-spacing: -0.02em !important;
        }
        .rich-editor-canvas h2 {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif !important;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.6rem !important;
          border-bottom: 1px dashed #e2e8f0 !important;
          padding-bottom: 0.25rem !important;
          color: #0f172a !important;
        }
        .rich-editor-canvas p {
          margin-top: 0.6rem !important;
          margin-bottom: 0.6rem !important;
          color: #334155 !important;
        }
        .rich-editor-canvas ul {
          list-style-type: none !important;
          padding-left: 1.25rem !important;
          margin-top: 0.6rem !important;
          margin-bottom: 0.6rem !important;
        }
        .rich-editor-canvas ul li {
          position: relative !important;
          margin-top: 0.4rem !important;
          margin-bottom: 0.4rem !important;
          padding-left: 1rem !important;
        }
        .rich-editor-canvas ul li::before {
          content: "•" !important;
          color: #0284c7 !important;
          font-weight: bold !important;
          display: inline-block !important;
          width: 1em !important;
          margin-left: -1em !important;
          position: absolute !important;
          left: 0.25rem !important;
        }
        .rich-editor-canvas ol {
          list-style-type: decimal !important;
          padding-left: 1.75rem !important;
          margin-top: 0.6rem !important;
          margin-bottom: 0.6rem !important;
        }
        .rich-editor-canvas li {
          margin-top: 0.4rem !important;
          margin-bottom: 0.4rem !important;
        }
        .rich-editor-canvas blockquote {
          border-left: 4px solid #0284c7 !important;
          background: #f0f9ff !important;
          padding: 0.75rem 1.25rem !important;
          margin: 1.25rem 0 !important;
          border-top-right-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
          font-style: italic !important;
          color: #0369a1 !important;
          border-top: none !important;
          border-right: none !important;
          border-bottom: none !important;
        }
        .rich-editor-canvas a {
          color: #0284c7 !important;
          text-decoration: none !important;
          border-bottom: 1px solid #0284c7 !important;
          font-weight: 500 !important;
        }
        .rich-editor-canvas a:hover {
          border-bottom-width: 2px !important;
        }
        .rich-editor-canvas table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1.5rem 0 !important;
          font-size: 0.825rem !important;
        }
        .rich-editor-canvas th {
          background-color: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          padding: 0.5rem 0.75rem !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          text-align: left !important;
        }
        .rich-editor-canvas td {
          border: 1px solid #e2e8f0 !important;
          padding: 0.5rem 0.75rem !important;
          color: #334155 !important;
        }
        .rich-editor-canvas tr:nth-child(even) {
          background-color: rgba(248, 250, 252, 0.5) !important;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .rich-editor-canvas h1, .rich-editor-canvas h2 {
            color: black !important;
            border-color: #cbd5e1 !important;
          }
          .rich-editor-canvas p, .rich-editor-canvas li, .rich-editor-canvas blockquote {
            color: #1e293b !important;
          }
        }
      ` }} />

      {/* Navbar Minimalista */}
      <header className={`border-b sticky top-0 z-40 transition-colors duration-300 print:hidden ${
        isDarkTheme ? 'bg-[#0b0f19]/80 border-slate-800/80 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'
      }`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="OkanPro Logo" 
              width={28} 
              height={28} 
              className="object-contain"
            />
            <span className={`font-black tracking-wider text-sm transition-colors ${
              isDarkTheme ? 'text-white' : 'text-slate-800'
            }`}>OKANPRO</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón alternador de tema Claro / Oscuro para el fondo */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer mr-1 ${
                isDarkTheme 
                  ? 'border-slate-800 hover:bg-slate-800 text-amber-400' 
                  : 'border-slate-200 hover:bg-slate-100 text-sky-600'
              }`}
              title={isDarkTheme ? 'Cambiar a fondo claro' : 'Cambiar a fondo oscuro'}
            >
              {isDarkTheme ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button
              onClick={handlePrint}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                isDarkTheme 
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Printer size={13} />
              Imprimir / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Contenido del Documento */}
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-slate-800 print:border-none print:bg-transparent print:shadow-none print:p-0">
          
          {/* Acento lateral de la hoja */}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary via-sky-500 to-cyan-500 print:hidden" />

          {/* Marca de agua elegante de OkanPro en el fondo del papel */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none -z-10">
            <img src="/logo.png" alt="OkanPro Watermark" className="w-96 h-96 object-contain rotate-12" />
          </div>

          {/* Barra de brillo superior de la hoja en pantalla */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10 absolute top-0 left-0 print:hidden" />

          {/* Cabecera Oficial de Marca de OkanPro (Carta Membretada) */}
          <div className="relative pb-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Logo y Nombre de Empresa */}
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="OkanPro Logo" className="w-11 h-11 object-contain" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold tracking-[0.2em] text-base text-slate-900 leading-none">OKANPRO</span>
                    <span className="text-[7px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider leading-none">Oficial</span>
                  </div>
                </div>
              </div>
              
              {/* Matriz Técnica de Documento */}
              <div className="flex flex-col text-[10px] gap-1.5 w-full sm:w-auto text-left sm:text-right shrink-0">
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Código</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{docCode}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Categoría</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold capitalize ${getCategoryStyle(manual.category)}`}>
                    {manual.category}
                  </span>
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Versión</span>
                  <span className="font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">1.0 (Original)</span>
                </div>
                {manual.gdrive_url && (
                  <div className="flex items-center sm:justify-end gap-2">
                    <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Google Drive</span>
                    <a
                      href={manual.gdrive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors px-2 py-0.5 rounded border border-sky-200/50 flex items-center gap-1 text-[8px]"
                    >
                      <ExternalLink size={8} />
                      Abrir Documento
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Separador corporativo de diseño */}
            <div className="h-[2px] w-full bg-slate-100 relative mt-5">
              <div className="absolute top-0 left-0 h-full w-28 bg-gradient-to-r from-primary to-cyan-500" />
            </div>
          </div>

          {/* Header del Manual */}
          <div className="text-left space-y-3 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight font-display">
                {manual.title}
              </h1>

              {manual.description && (
                <p className="text-sm text-slate-500 leading-relaxed font-medium pl-4 border-l-2 border-sky-500/40">
                  {manual.description}
                </p>
              )}
            </div>

            {/* Tabla de metadatos del documento */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 p-1.5 text-slate-500 text-[10px] mt-5 border-t border-b border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                  <Calendar size={13} />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">FECHA EMISIÓN</span>
                  <span className="font-bold text-slate-700">{formattedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                  <ShieldCheck size={13} />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">DEPARTAMENTO</span>
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Ingeniería / Soporte</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                  <Tag size={13} />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">CATEGORÍA</span>
                  <span className="font-bold text-slate-700 capitalize">{manual.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck size={13} />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">ESTADO</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                    Oficial Verificado
                  </span>
                </div>
              </div>
              {manual.gdrive_url && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                    <FileText size={13} />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-sky-500 uppercase tracking-wider block leading-none mb-0.5">GOOGLE DRIVE</span>
                    <a
                      href={manual.gdrive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sky-700 hover:text-sky-900 transition-colors flex items-center gap-0.5"
                    >
                      Abrir en la Nube
                      <ExternalLink size={8} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cuerpo del Manual */}
          <article className="max-w-none min-h-[300px]">
            {manual.content ? (
              // Manual Interno Escrito (HTML)
              <div 
                className="rich-editor-canvas text-sm text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: manual.content }}
              />
            ) : (
              // Enlace Externo Fallback
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 print:hidden">
                <FileText size={48} className="text-primary/70 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Documento en Enlace Externo</h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-md leading-relaxed">
                    Este documento se encuentra alojado en un servidor externo. Presiona el botón a continuación para abrirlo directamente en una nueva pestaña.
                  </p>
                </div>
                <a
                  href={manual.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/95 transition-all"
                >
                  Abrir Documento
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </article>

          {/* Pie de página oficial corporativo */}
          <div className="mt-12 pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-400 gap-3 print:border-slate-300">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
              <span className="font-bold text-slate-500">OKANPRO</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span>Documento Técnico Oficial</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-slate-500 uppercase tracking-wider">CONFIDENCIAL • USO AUTORIZADO</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
          <div className="mt-3 text-center text-[8px] text-slate-300 print:hidden flex justify-center gap-4 border-t border-slate-100 pt-2.5">
            <a href="https://www.okanpro.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.okanpro.com</a>
            <span>•</span>
            <a href="mailto:soporte@okanpro.com" className="hover:text-primary transition-colors">soporte@okanpro.com</a>
          </div>

        </div>
      </main>
    </div>
  );
}
