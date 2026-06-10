'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { manualsService } from '@/services/manualsService';
import { Manual } from '@/types';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Palette,
  Check,
  AlertCircle,
  Tag,
  Calendar,
  ShieldCheck,
  Paintbrush,
  FileText,
  ExternalLink
} from 'lucide-react';
import { loadGoogleScripts, getGoogleAccessToken, formatBytes, uploadHtmlToGoogleDrive, extractGoogleFileId } from '@/lib/googleDrive';

const MOCK_DRIVE_FILES = [
  { id: '1', name: 'Catálogo_OkanPro_Paneles_Solares_2026.pdf', size: 4851200, mimeType: 'application/pdf', url: 'https://drive.google.com/file/d/1CatOkanProPaneles2026/view?usp=sharing' },
  { id: '2', name: 'Ficha_Tecnica_Inversor_Central_OP-15K.pdf', size: 1850200, mimeType: 'application/pdf', url: 'https://drive.google.com/file/d/1FichaTecnicaInversorOP15K/view?usp=sharing' },
  { id: '3', name: 'Presentacion_Corporativa_Eficiencia_Energetica.pptx', size: 12500000, mimeType: 'application/vnd.google-apps.presentation', url: 'https://drive.google.com/file/d/1PresCorpEficiencia2026/view?usp=sharing' },
  { id: '4', name: 'Presupuesto_Plantilla_Calculo_Retorno_Inversion.xlsx', size: 350000, mimeType: 'application/vnd.google-apps.spreadsheet', url: 'https://drive.google.com/file/d/1PresCalculoRetorno/view?usp=sharing' },
  { id: '5', name: 'Guia_Usuario_Monitoreo_App_OkanPro.pdf', size: 2350000, mimeType: 'application/pdf', url: 'https://drive.google.com/file/d/1GuiaMonitoreoApp/view?usp=sharing' }
];

const TEXT_COLORS = [
  { name: 'Defecto', value: '#334155' },
  { name: 'Negro', value: '#0f172a' },
  { name: 'Gris oscuro', value: '#64748b' },
  { name: 'Azul OkanPro', value: '#0284c7' },
  { name: 'Verde Esmeralda', value: '#059669' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Ámbar/Naranja', value: '#d97706' }
];

const FONT_FAMILIES = [
  { name: 'Plus Jakarta Sans (Defecto)', value: 'Plus Jakarta Sans' },
  { name: 'Outfit (Corporativa)', value: 'Outfit' },
  { name: 'Inter (Lectura)', value: 'Inter' },
  { name: 'Playfair Display (Serif Elegante)', value: 'Playfair Display' },
  { name: 'Georgia (Serif Clásico)', value: 'Georgia' },
  { name: 'Courier New (Monospaciado)', value: 'Courier New' }
];

const FONT_SIZES = [
  { name: '11px', value: '11px' },
  { name: '12px', value: '12px' },
  { name: '14px', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '24px', value: '24px' },
  { name: '30px', value: '30px' }
];

export default function EditManualPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isInternal, setIsInternal] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<{
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  } | null>(null);
  const [isFormatPainterActive, setIsFormatPainterActive] = useState(false);
  const [showSimulatedPicker, setShowSimulatedPicker] = useState(false);
  const [googleApiLoading, setGoogleApiLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Instalación',
    file_url: '',
    file_size: '',
    content: '',
    gdrive_url: ''
  });

  const handleGoogleDriveClick = async () => {
    const clientId = localStorage.getItem('okanpro_gauth_client_id') || '';
    const apiKey = localStorage.getItem('okanpro_gauth_api_key') || '';

    if (!clientId || !apiKey) {
      setShowSimulatedPicker(true);
      return;
    }

    setGoogleApiLoading(true);
    try {
      await loadGoogleScripts();
      const token = await getGoogleAccessToken(clientId);
      
      const gapi = (window as any).gapi;
      gapi.load('picker', () => {
        try {
          const view = new (window as any).google.picker.View((window as any).google.picker.ViewId.DOCS);
          const picker = new (window as any).google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(token)
            .setDeveloperKey(apiKey)
            .setCallback((data: any) => {
              if (data.action === (window as any).google.picker.Action.PICKED) {
                const doc = data.docs[0];
                const fileUrl = doc.url || `https://drive.google.com/file/d/${doc.id}/view?usp=sharing`;
                const fileName = doc.name || 'Documento sin título';
                const fileSizeInBytes = doc.sizeBytes || 0;
                
                setFormData(prev => ({
                  ...prev,
                  title: prev.title || fileName.replace(/\.[a-z0-9]+$/i, ''),
                  file_url: fileUrl,
                  file_size: fileSizeInBytes ? formatBytes(fileSizeInBytes) : 'Archivo de Drive'
                }));
              }
            })
            .build();
          picker.setVisible(true);
        } catch (err: any) {
          console.error('Error al inicializar Google Picker:', err);
          alert('Error al abrir Google Picker: ' + err.message);
        }
      });
    } catch (err: any) {
      console.error('Error en autenticación de Google:', err);
      alert('No se pudo autenticar con Google. Abriendo el simulador de prueba.\nDetalle: ' + err.message);
      setShowSimulatedPicker(true);
    } finally {
      setGoogleApiLoading(false);
    }
  };

  const editorRef = useRef<HTMLDivElement>(null);

  const getCategoryStyle = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('instalaci')) return 'bg-blue-50 text-blue-700 border border-blue-200/70';
    if (cat.includes('técnic') || cat.includes('tecnic')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200/70';
    if (cat.includes('presentaci')) return 'bg-amber-50 text-amber-700 border border-amber-200/70';
    if (cat.includes('cotizaci')) return 'bg-violet-50 text-violet-750 border border-violet-200/70';
    if (cat.includes('desarrollo')) return 'bg-rose-50 text-rose-700 border border-rose-200/70';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  useEffect(() => {
    if (!isNew) {
      loadManual();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && editorRef.current) {
      editorRef.current.innerHTML = formData.content || '<p><br></p>';
    }
  }, [loading]);

  const loadManual = async () => {
    try {
      const data = await manualsService.getManualById(id);
      const hasContent = data.content !== undefined && data.content !== null;
      setIsInternal(hasContent);
      setFormData({
        title: data.title,
        description: data.description || '',
        category: data.category,
        file_url: data.file_url || '',
        file_size: data.file_size || '',
        content: data.content || '',
        gdrive_url: data.gdrive_url || ''
      });
    } catch (err) {
      console.error('Error cargando manual para edición:', err);
      alert('No se pudo cargar el manual especificado.');
      router.push('/manuals');
    } finally {
      setLoading(false);
    }
  };

  const execCmd = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateEditorState();
  };

  const updateEditorState = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        content: editorRef.current?.innerHTML || ''
      }));
    }
  };

  const changeFontFamily = (fontName: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    document.execCommand('fontName', false, 'Arial');
    const editor = editorRef.current;
    if (editor) {
      const fontTags = editor.querySelectorAll('font[face="Arial"]');
      fontTags.forEach(tag => {
        const span = document.createElement('span');
        span.style.fontFamily = fontName;
        span.innerHTML = tag.innerHTML;
        tag.parentNode?.replaceChild(span, tag);
      });
      updateEditorState();
    }
  };

  const changeFontSize = (sizeInPx: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    document.execCommand('fontSize', false, '7');
    const editor = editorRef.current;
    if (editor) {
      const fontTags = editor.querySelectorAll('font[size="7"]');
      fontTags.forEach(tag => {
        const span = document.createElement('span');
        span.style.fontSize = sizeInPx;
        span.innerHTML = tag.innerHTML;
        tag.parentNode?.replaceChild(span, tag);
      });
      updateEditorState();
    }
  };

  const copyFormat = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    let element: HTMLElement | null = null;
    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      element = node as HTMLElement;
    } else if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
      element = node.parentNode as HTMLElement;
    }
    
    if (element) {
      const style = window.getComputedStyle(element);
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      
      setCopiedFormat({
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        color: style.color,
        bold,
        italic,
        underline
      });
      setIsFormatPainterActive(true);
    }
  };

  const applyCopiedFormat = () => {
    if (!isFormatPainterActive || !copiedFormat) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    const currentBold = document.queryCommandState('bold');
    const currentItalic = document.queryCommandState('italic');
    const currentUnderline = document.queryCommandState('underline');
    
    if (copiedFormat.bold !== currentBold) {
      document.execCommand('bold', false);
    }
    if (copiedFormat.italic !== currentItalic) {
      document.execCommand('italic', false);
    }
    if (copiedFormat.underline !== currentUnderline) {
      document.execCommand('underline', false);
    }
    
    document.execCommand('styleWithCSS', false, 'true');
    
    if (copiedFormat.fontSize) {
      document.execCommand('fontSize', false, '7');
      const editor = editorRef.current;
      if (editor) {
        const fontTags = editor.querySelectorAll('font[size="7"]');
        fontTags.forEach(tag => {
          const span = document.createElement('span');
          span.style.fontSize = copiedFormat.fontSize || '';
          if (copiedFormat.fontFamily) span.style.fontFamily = copiedFormat.fontFamily;
          if (copiedFormat.color) span.style.color = copiedFormat.color;
          span.innerHTML = tag.innerHTML;
          tag.parentNode?.replaceChild(span, tag);
        });
      }
    } else {
      if (copiedFormat.fontFamily) {
        document.execCommand('fontName', false, copiedFormat.fontFamily);
      }
      if (copiedFormat.color) {
        document.execCommand('foreColor', false, copiedFormat.color);
      }
    }
    
    setIsFormatPainterActive(false);
    updateEditorState();
  };

  const handleInsertLink = () => {
    const url = prompt('Introduce la dirección del enlace (URL):', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    if (!isInternal && !formData.file_url) return;

    setSaving(true);
    try {
      let gdriveUrl = formData.gdrive_url || '';

      if (isInternal) {
        // Intentar guardar en Google Drive si es un manual escrito (interno)
        const clientId = localStorage.getItem('okanpro_gauth_client_id') || '';
        if (clientId) {
          const existingFileId = extractGoogleFileId(gdriveUrl);
          const uploadRes = await uploadHtmlToGoogleDrive(clientId, formData.title, formData.content, existingFileId);
          if (uploadRes.success && uploadRes.webViewLink) {
            gdriveUrl = uploadRes.webViewLink;
          } else {
            console.warn("Fallo el guardado en Google Drive real, usando simulación o conservando anterior:", uploadRes.error);
            if (!gdriveUrl) {
              gdriveUrl = `https://docs.google.com/document/d/mock-${Date.now()}/edit`;
            }
          }
        } else {
          // Modo simulador
          if (!gdriveUrl) {
            gdriveUrl = `https://docs.google.com/document/d/mock-${Date.now()}/edit`;
          }
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        file_url: isInternal ? '' : formData.file_url,
        file_size: isInternal ? 'Escrito' : (formData.file_size || 'General'),
        content: isInternal ? formData.content : null,
        gdrive_url: isInternal ? gdriveUrl : null
      };

      if (isNew) {
        await manualsService.createManual(payload);
      } else {
        await manualsService.updateManual(id, payload);
      }
      router.push('/manuals');
    } catch (err) {
      console.error('Error al guardar documento:', err);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-foreground">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            CARGANDO EDITOR...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Estilo CSS local para asegurar la renderización en el editor y preview en formato HOJA BLANCA */}
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
      ` }} />

      <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-fade-in">
        {/* Barra de herramientas superior */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/manuals')}
              className="p-2 rounded-xl bg-secondary hover:bg-border text-foreground transition-colors cursor-pointer"
              title="Volver"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isNew ? 'Redactar Nuevo Manual' : 'Editar Manual'}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Lienzo de texto tipo Word con formato imprimible
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle de vistas */}
            <div className="flex bg-secondary p-0.5 rounded-lg border border-border md:flex hidden">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === 'edit' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Solo Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Pantalla Dividida
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === 'preview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Vista de Cliente
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Layout Principal del Canvas */}
        <div className="flex-1 flex overflow-hidden gap-4 min-h-0">
          
          {/* Columna 1: Formulario y Editor */}
          <div 
            className={`flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-y-auto p-5 space-y-4 transition-all duration-300 ${
              viewMode === 'preview' ? 'hidden md:hidden' : 'w-full'
            }`}
          >
            {/* Selector de Tipo de Documento */}
            <div className="flex bg-secondary p-1 rounded-xl border border-border/80 w-full shrink-0">
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isInternal 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Enlace Externo (URL)
              </button>
              <button
                type="button"
                onClick={() => setIsInternal(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isInternal 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Documento Escrito (Editor Word)
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col gap-4 min-h-0">
              {/* Título - Entrada Grande tipo Canvas */}
              <div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del Manual o Documento..."
                  className="w-full text-xl font-bold tracking-tight text-foreground bg-transparent border-none focus:outline-none placeholder-muted-foreground/30 py-1"
                />
                <div className="h-[1px] bg-border/40 mt-1" />
              </div>

              {/* Grid de Metadatos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="Instalación">Instalación</option>
                    <option value="Fichas Técnicas">Fichas Técnicas</option>
                    <option value="Presentaciones">Presentaciones</option>
                    <option value="Cotizaciones">Cotizaciones</option>
                    <option value="Desarrollos">Desarrollos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Descripción Corta</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ej. Guía técnica con formato detallado para inversores de OkanPro."
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Editor de Enlace Externo */}
              {!isInternal && (
                <div className="space-y-3 p-4 bg-secondary/30 rounded-2xl border border-border/80">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Enlace del Archivo (URL)</label>
                      <button
                        type="button"
                        disabled={googleApiLoading}
                        onClick={handleGoogleDriveClick}
                        className="flex items-center gap-1 text-[10px] font-bold text-sky-500 hover:text-sky-600 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {googleApiLoading ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46.2 14.25 0 14 0h-4c-.25 0-.46.2-.49.45L9.13 3.1c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.25.24.45.49.45h4c.25 0 .46-.2.49-.45l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                          </svg>
                        )}
                        {googleApiLoading ? 'Conectando...' : 'Seleccionar de Google Drive'}
                      </button>
                    </div>
                    <input
                      type="url"
                      required={!isInternal}
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://drive.google.com/file/d/... o enlace de descarga"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Tamaño (opcional)</label>
                    <input
                      type="text"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      placeholder="ej. 4.2 MB"
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <AlertCircle size={12} className="shrink-0 mt-0.5 text-primary" />
                    <span>Carga el archivo en Google Drive, o utiliza el selector de Google Drive.</span>
                  </p>
                </div>
              )}

              {/* Editor de Texto Escrito (Estilo Word WYSIWYG) */}
              {isInternal && (
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                  <div className="flex justify-between items-center mb-1 shrink-0">
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Hoja de Redacción (Word)</label>
                  </div>

                  {/* Barra de herramientas enriquecida tipo Word */}
                  <div className="flex flex-wrap gap-1 p-1.5 bg-secondary/60 border border-b-0 border-border rounded-t-xl shrink-0 items-center select-none">
                    {/* Formato */}
                    <button
                      type="button"
                      onClick={() => execCmd('bold')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Negrita"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('italic')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Cursiva"
                    >
                      <Italic size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('underline')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Subrayado"
                    >
                      <Underline size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('strikeThrough')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Tachado"
                    >
                      <Strikethrough size={13} />
                    </button>

                    {/* Copiar Formato */}
                    <button
                      type="button"
                      onClick={copyFormat}
                      className={`p-1.5 hover:bg-background/80 rounded cursor-pointer transition-colors ${
                        isFormatPainterActive 
                          ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      title="Copiar Formato (Brocha)"
                    >
                      <Paintbrush size={13} />
                    </button>

                    <div className="w-[1px] h-4 bg-border/60 mx-1" />

                    {/* Encabezados */}
                    <button
                      type="button"
                      onClick={() => execCmd('formatBlock', '<h1>')}
                      className="px-1.5 py-0.5 hover:bg-background/80 rounded text-[10px] font-extrabold text-foreground cursor-pointer"
                      title="Título Grande"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('formatBlock', '<h2>')}
                      className="px-1.5 py-0.5 hover:bg-background/80 rounded text-[10px] font-extrabold text-foreground cursor-pointer"
                      title="Título Mediano"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('formatBlock', '<p>')}
                      className="px-1.5 py-0.5 hover:bg-background/80 rounded text-[10px] text-foreground cursor-pointer"
                      title="Texto Normal"
                    >
                      Normal
                    </button>

                    {/* Selector de Fuente */}
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          changeFontFamily(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="h-7 px-1.5 rounded border border-border bg-background text-foreground text-[10px] focus:outline-none cursor-pointer max-w-[130px]"
                      title="Tipo de Letra"
                    >
                      <option value="" disabled hidden>Fuente...</option>
                      {FONT_FAMILIES.map(font => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </option>
                      ))}
                    </select>

                    {/* Selector de Tamaño */}
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          changeFontSize(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="h-7 px-1.5 rounded border border-border bg-background text-foreground text-[10px] focus:outline-none cursor-pointer"
                      title="Tamaño de Letra"
                    >
                      <option value="" disabled hidden>Tamaño...</option>
                      {FONT_SIZES.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.name}
                        </option>
                      ))}
                    </select>

                    <div className="w-[1px] h-4 bg-border/60 mx-1" />

                    {/* Alineaciones */}
                    <button
                      type="button"
                      onClick={() => execCmd('justifyLeft')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Alinear Izquierda"
                    >
                      <AlignLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('justifyCenter')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Centrar"
                    >
                      <AlignCenter size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('justifyRight')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Alinear Derecha"
                    >
                      <AlignRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('justifyFull')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Justificar"
                    >
                      <AlignJustify size={13} />
                    </button>

                    <div className="w-[1px] h-4 bg-border/60 mx-1" />

                    {/* Listas */}
                    <button
                      type="button"
                      onClick={() => execCmd('insertUnorderedList')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Lista de Viñetas"
                    >
                      <List size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCmd('insertOrderedList')}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Lista Numerada"
                    >
                      <ListOrdered size={13} />
                    </button>

                    <div className="w-[1px] h-4 bg-border/60 mx-1" />

                    {/* Enlace */}
                    <button
                      type="button"
                      onClick={handleInsertLink}
                      className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors"
                      title="Insertar Enlace"
                    >
                      <Link size={13} />
                    </button>

                    {/* Color del texto */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 hover:bg-background/80 hover:text-primary rounded text-foreground cursor-pointer transition-colors flex items-center gap-0.5"
                        title="Color de Texto"
                      >
                        <Palette size={13} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </button>

                      {showColorPicker && (
                        <div className="absolute top-8 left-0 z-50 bg-card border border-border rounded-xl p-2 shadow-xl flex gap-1.5 flex-col w-36 animate-fade-in">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase pb-1 border-b border-border/50">Color de texto</p>
                          {TEXT_COLORS.map(c => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => {
                                execCmd('foreColor', c.value);
                                setShowColorPicker(false);
                              }}
                              className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-secondary text-[10px] text-foreground text-left cursor-pointer transition-colors w-full"
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-border/50 shrink-0" style={{ backgroundColor: c.value }} />
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campo de escritura tipo Word con contentEditable (Hoja blanca física) */}
                  <div
                    contentEditable
                    ref={editorRef}
                    id="editor-canvas"
                    onInput={updateEditorState}
                    onMouseUp={() => {
                      if (isFormatPainterActive) {
                        applyCopiedFormat();
                      }
                    }}
                    className="flex-1 w-full p-8 rounded-b-xl border border-border bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[350px] overflow-y-auto outline-none rich-editor-canvas shadow-lg"
                  />
                </div>
              )}
            </form>
          </div>

          {/* Columna 2: Vista previa (Preview) */}
          {isInternal && (
            <div 
              className={`flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-y-auto p-5 transition-all duration-300 ${
                viewMode === 'edit' ? 'hidden md:hidden' : 'w-full'
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Vista preliminar del cliente
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Check size={10} />
                  Vista del Cliente
                </span>
              </div>

              {/* Simulación del Reader (Hoja blanca física) */}
              <div className="flex-1 bg-white border border-slate-200 rounded-xl p-8 shadow-lg overflow-y-auto relative overflow-hidden rich-editor-canvas text-slate-800">
                
                {/* Acento lateral de la hoja */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary via-sky-500 to-cyan-500" />

                {/* Marca de agua de OkanPro */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none -z-10">
                  <img src="/logo.png" alt="OkanPro Watermark" className="w-80 h-80 object-contain rotate-12" />
                </div>

                {/* Barra de brillo superior de la hoja */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10 absolute top-0 left-0" />

                {/* Cabecera Oficial de Marca de OkanPro (Membretada) */}
                <div className="relative pb-4 mb-5 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Logo y Nombre de Empresa */}
                    <div className="flex items-center gap-2.5">
                      <img src="/logo.png" alt="OkanPro Logo" className="w-9 h-9 object-contain" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold tracking-[0.2em] text-xs text-slate-900 leading-none">OKANPRO</span>
                          <span className="text-[6px] font-extrabold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase tracking-wider leading-none">Oficial</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Matriz Técnica de Documento */}
                    <div className="flex flex-col text-[10px] gap-1.5 w-full sm:w-auto text-left sm:text-right shrink-0">
                      <div className="flex items-center sm:justify-end gap-2">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Código</span>
                        <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          OP-DOC-{id === 'new' ? 'NUEVO' : id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-2">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Categoría</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold capitalize ${getCategoryStyle(formData.category)}`}>
                          {formData.category}
                        </span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-2">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Versión</span>
                        <span className="font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">1.0 (Original)</span>
                      </div>
                      {formData.gdrive_url && (
                        <div className="flex items-center sm:justify-end gap-2">
                          <span className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Google Drive</span>
                          <a
                            href={formData.gdrive_url}
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
                  <div className="h-[2px] w-full bg-slate-100 relative mt-4">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-primary to-cyan-500" />
                  </div>
                </div>

                {/* Header del Manual */}
                <div className="text-left space-y-2 mb-6 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight font-display">
                      {formData.title || 'Título del Documento'}
                    </h1>

                    {formData.description && (
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-3 border-l-2 border-sky-500/40">
                        {formData.description}
                      </p>
                    )}
                  </div>

                  {/* Tabla de metadatos rápida (Mini) */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 p-1.5 text-slate-500 text-[10px] mt-4 border-t border-b border-slate-100 py-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <Calendar size={12} />
                      </div>
                      <div>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">FECHA EMISIÓN</span>
                        <span className="font-bold text-slate-700">Hoy (Edición)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <ShieldCheck size={12} />
                      </div>
                      <div>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">DEPARTAMENTO</span>
                        <span className="font-bold text-slate-700 uppercase tracking-wider">Ingeniería</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <Tag size={12} />
                      </div>
                      <div>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">CATEGORÍA</span>
                        <span className="font-bold text-slate-700 capitalize">{formData.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <ShieldCheck size={12} />
                      </div>
                      <div>
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">ESTADO</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check size={10} className="shrink-0" />
                          Borrador Oficial
                        </span>
                      </div>
                    </div>
                    {formData.gdrive_url && (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                          <FileText size={12} />
                        </div>
                        <div>
                          <span className="text-[7px] font-bold text-sky-500 uppercase tracking-wider block leading-none mb-0.5">GOOGLE DRIVE</span>
                          <a
                            href={formData.gdrive_url}
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

                {/* Renderizar HTML Guardado */}
                <div 
                  className="rich-editor-canvas text-xs text-slate-700 leading-relaxed text-left min-h-[150px]"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p class="italic text-slate-400">Sin contenido registrado.</p>' }}
                />

                {/* Pie de página */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">OKANPRO</span>
                    <span>•</span>
                    <span>Documento Oficial</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-500">CONFIDENCIAL</span>
                    <span>Pág. 1 / 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSimulatedPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-slate-800">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            {/* Cabecera del Modal */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46.2 14.25 0 14 0h-4c-.25 0-.46.2-.49.45L9.13 3.1c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.25.24.45.49.45h4c.25 0 .46-.2.49-.45l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Google Drive (Simulador de Archivos)</h3>
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Modo Demo / Pruebas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatedPicker(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>

            {/* Listado de archivos */}
            <div className="p-2 overflow-y-auto flex-1 divide-y divide-border/40">
              {MOCK_DRIVE_FILES.map(file => (
                <div
                  key={file.id}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      title: prev.title || file.name.replace(/\.[a-z0-9]+$/i, ''),
                      file_url: file.url,
                      file_size: formatBytes(file.size)
                    }));
                    setShowSimulatedPicker(false);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-secondary/40 cursor-pointer rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-secondary rounded-lg text-sky-500 group-hover:bg-primary/10 transition-colors">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{file.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Google Drive · Documento de Referencia</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-bold">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>

            {/* Pie de página con instrucción de configuración */}
            <div className="p-4 bg-secondary/30 border-t border-border text-[10px] text-muted-foreground flex flex-col gap-2">
              <p>💡 <strong>¿Quieres probar con tu Google Drive real?</strong> Abre la pestaña de Ajustes y agrega tu Client ID y API Key de Google Cloud.</p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
