'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { quotesService } from '@/services/quotesService';
import { Quote } from '@/types';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Filter, 
  Activity, 
  DollarSign, 
  Printer, 
  FileCheck,
  Clock,
  XCircle,
  FileCode
} from 'lucide-react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await quotesService.getQuotes();
      setQuotes(data);
    } catch (err) {
      console.error('Error cargando cotizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta cotización? Esta acción no se puede deshacer.')) return;
    try {
      await quotesService.deleteQuote(id);
      loadQuotes();
    } catch (err) {
      console.error('Error eliminando cotización:', err);
      alert('Ocurrió un error al eliminar la cotización.');
    }
  };

  // Métricas calculadas
  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((acc, curr) => acc + curr.total, 0);
  
  const statusCounts = quotes.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const draftCount = statusCounts['borrador'] || 0;
  const sentCount = statusCounts['enviada'] || 0;
  const acceptedCount = statusCounts['aceptada'] || 0;
  const rejectedCount = statusCounts['rechazada'] || 0;

  // Filtrado de lista
  const filteredQuotes = quotes.filter(quote => {
    const clientName = quote.lead 
      ? `${quote.lead.first_name} ${quote.lead.last_name} ${quote.lead.company || ''}`.toLowerCase()
      : '';
    const matchesSearch = 
      quote.title.toLowerCase().includes(search.toLowerCase()) || 
      clientName.includes(search.toLowerCase()) ||
      quote.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Quote['status']) => {
    switch (status) {
      case 'borrador':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            Borrador
          </span>
        );
      case 'enviada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Enviada
          </span>
        );
      case 'aceptada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Aceptada
          </span>
        );
      case 'rechazada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Cotizaciones</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Genera, edita e imprime cotizaciones formales para tus prospectos y clientes.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadQuotes}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Actualizar listado"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              href="/quotes/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Crear Cotización
            </Link>
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Volumen Total */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monto Total</span>
              <p className="text-xl font-extrabold text-foreground">${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Card 2: Borrador */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Borradores</span>
              <p className="text-xl font-extrabold text-muted-foreground">{draftCount}</p>
            </div>
            <div className="p-3 bg-secondary text-muted-foreground rounded-xl">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 3: Enviadas */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enviadas</span>
              <p className="text-xl font-extrabold text-sky-400">{sentCount}</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <FileCode size={20} />
            </div>
          </div>

          {/* Card 4: Aceptadas */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aceptadas</span>
              <p className="text-xl font-extrabold text-emerald-400">{acceptedCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FileCheck size={20} />
            </div>
          </div>

          {/* Card 5: Rechazadas */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rechazadas</span>
              <p className="text-xl font-extrabold text-red-400">{rejectedCount}</p>
            </div>
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
              <XCircle size={20} />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título de cotización o cliente..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Selector de Estado */}
          <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
            <Filter size={12} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none p-0 focus:outline-none text-foreground cursor-pointer font-medium"
            >
              <option value="todos">Todos los Estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>

        {/* Tabla de Cotizaciones */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-primary" />
              Cargando cotizaciones...
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground italic">
              No se encontraron cotizaciones registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-4">Título / Folio</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4 text-right">Subtotal</th>
                    <th className="p-4 text-right">Descuento</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredQuotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-primary/70 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground text-xs">{quote.title}</p>
                            <p className="text-[9px] text-muted-foreground font-mono font-medium">{quote.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {quote.lead ? (
                          <div>
                            <p className="font-semibold text-foreground">{quote.lead.first_name} {quote.lead.last_name}</p>
                            {quote.lead.company && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{quote.lead.company}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Cliente no disponible</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-muted-foreground font-medium">
                        {new Date(quote.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap font-medium text-muted-foreground">
                        ${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap font-medium text-red-400">
                        {quote.discount > 0 ? `-$${quote.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap font-extrabold text-foreground">
                        ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/quotes/edit/${quote.id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Editar cotización"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cotización"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
