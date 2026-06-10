'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { manualsService } from '@/services/manualsService';
import { Manual } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Link2, 
  ExternalLink, 
  Trash2, 
  Check, 
  BookOpen, 
  AlertCircle,
  Edit
} from 'lucide-react';

export default function ManualsPage() {
  const router = useRouter();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadManuals();
  }, []);

  const loadManuals = async () => {
    setLoading(true);
    try {
      const data = await manualsService.getManuals();
      setManuals(data);
    } catch (err) {
      console.error('Error cargando manuales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (manual: Manual, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/manuals/edit/${manual.id}`);
  };

  const handleDeleteManual = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;

    try {
      await manualsService.deleteManual(id);
      setManuals(manuals.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error eliminando manual:', err);
    }
  };

  const handleCopyLink = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const absoluteUrl = url.startsWith('/') ? window.location.origin + url : url;
    navigator.clipboard.writeText(absoluteUrl);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Obtener categorías únicas para el filtro
  const categories = ['todos', ...Array.from(new Set(manuals.map(m => m.category)))];

  // Filtrado de manuales
  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = 
      manual.title.toLowerCase().includes(search.toLowerCase()) ||
      (manual.description || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || manual.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Manuales y Documentación</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gestiona fichas técnicas, catálogos o presentaciones para compartir directamente con tus clientes.
            </p>
          </div>
          <button
            onClick={() => router.push('/manuals/edit/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Subir Documento
          </button>
        </div>

        {/* Filter and Search Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todos' ? 'Categorías: Todas' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid layout of documents */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredManuals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-3 bg-card border border-border rounded-2xl">
            <BookOpen size={40} className="text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">No hay documentos registrados</p>
            <p className="text-xs text-muted-foreground/80">Sube tus archivos para empezar a compartirlos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManuals.map(manual => (
              <div 
                key={manual.id} 
                onClick={(e) => handleEditClick(manual, e)}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer group"
                title="Hacer clic para editar este documento"
              >
                <div>
                  {/* Category Tag & Size */}
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10 capitalize">
                      {manual.category}
                    </span>
                    {manual.file_size && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {manual.file_size}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-secondary rounded-xl text-foreground shrink-0 h-fit group-hover:bg-primary/10 transition-colors">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">{manual.title}</h4>
                      {manual.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{manual.description}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50 italic mt-1">Sin descripción disponible.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer sharing actions */}
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                  {/* Delete button (Left) */}
                  <button
                    onClick={(e) => handleDeleteManual(manual.id, e)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-destructive/20"
                    title="Eliminar documento"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex gap-1.5 shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={(e) => handleEditClick(manual, e)}
                      className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 bg-secondary/80 hover:bg-primary/10 text-foreground hover:text-primary border border-border cursor-pointer transition-colors"
                      title="Editar documento"
                    >
                      <Edit size={10} />
                      Editar
                    </button>

                    {/* Share Copy Link */}
                    <button
                      onClick={(e) => handleCopyLink(manual.file_url, manual.id, e)}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer border transition-all ${
                        copiedId === manual.id
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-background hover:bg-secondary text-foreground border-border'
                      }`}
                    >
                      {copiedId === manual.id ? (
                        <>
                          <Check size={10} />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Link2 size={10} />
                          Compartir
                        </>
                      )}
                    </button>

                    {/* Open in Google Drive if present */}
                    {manual.gdrive_url && (
                      <a
                        href={manual.gdrive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/50 transition-colors"
                        title="Abrir en Google Drive"
                      >
                        <ExternalLink size={10} />
                        Drive
                      </a>
                    )}

                    {/* Open in new tab */}
                    <a
                      href={manual.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground transition-colors"
                    >
                      <ExternalLink size={10} />
                      Abrir
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
