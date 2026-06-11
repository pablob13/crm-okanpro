'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteItem, Lead, Product, QuoteStatus } from '@/types';
import { leadsService } from '@/services/leadsService';
import { productsService } from '@/services/productsService';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Printer, 
  AlertCircle,
  FileText,
  User,
  ShoppingBag
} from 'lucide-react';

interface QuoteFormProps {
  initialQuote?: Quote & { items: QuoteItem[] };
  onSubmit: (
    quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ) => Promise<void>;
  isEdit?: boolean;
}

interface FormItem {
  id: string; // temp id for keying react elements
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function QuoteForm({ initialQuote, onSubmit, isEdit = false }: QuoteFormProps) {
  const router = useRouter();
  
  // Data lists
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [title, setTitle] = useState(initialQuote?.title || 'Cotización de Proyecto');
  const [clientId, setClientId] = useState(initialQuote?.client_id || '');
  const [status, setStatus] = useState<QuoteStatus>(initialQuote?.status || 'borrador');
  const [notes, setNotes] = useState(initialQuote?.notes || '');
  const [discount, setDiscount] = useState<number>(initialQuote?.discount || 0);

  // Quote items state
  const [items, setItems] = useState<FormItem[]>([]);
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected client details for the print view
  const selectedLead = leads.find(l => l.id === clientId);

  // Load leads and products
  useEffect(() => {
    async function loadData() {
      try {
        const [leadsData, productsData] = await Promise.all([
          leadsService.getLeads(),
          productsService.getProducts()
        ]);
        setLeads(leadsData);
        setProducts(productsData.filter(p => p.active));
        
        // If editing, populate items
        if (initialQuote?.items) {
          setItems(initialQuote.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          })));
        } else {
          // If creating new, add one empty row by default
          addBlankItem();
        }
      } catch (err: any) {
        console.error('Error cargando catálogos para cotizador:', err);
        setErrorMsg('Error al cargar la información del sistema: ' + (err?.message || String(err)));
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [initialQuote]);

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const maxDiscount = subtotal;
  const actualDiscount = Math.min(discount, maxDiscount);
  const taxableAmount = Math.max(0, subtotal - actualDiscount);
  const tax = taxableAmount * 0.16; // IVA 16%
  const total = taxableAmount + tax;

  // Add a blank custom item
  const addBlankItem = () => {
    const newItem: FormItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      product_id: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Add product from catalog
  const handleAddCatalogProduct = (productId: string) => {
    if (!productId) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newItem: FormItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      product_id: prod.id,
      description: `${prod.name} (SKU: ${prod.sku || 'N/A'})`,
      quantity: 1,
      unit_price: prod.price,
      total: prod.price
    };

    // Remove the default blank row if it's empty
    setItems(prev => {
      const filtered = prev.filter(item => item.description.trim() !== '' || item.unit_price !== 0);
      return [...filtered, newItem];
    });
  };

  // Update item field
  const updateItemField = (id: string, field: keyof FormItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };
      
      // Calculate row total
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const price = field === 'unit_price' ? Number(value) : item.unit_price;
        updated.total = qty * price;
      }
      
      return updated;
    }));
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // Ensure there's always at least one row
      if (filtered.length === 0) {
        return [{
          id: `temp-${Date.now()}`,
          product_id: null,
          description: '',
          quantity: 1,
          unit_price: 0,
          total: 0
        }];
      }
      return filtered;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientId) {
      setErrorMsg('Debe seleccionar un cliente para la cotización.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Debe ingresar un título para la cotización.');
      return;
    }

    // Filter out completely empty items
    const validItems = items.filter(item => item.description.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Debe agregar al menos un concepto con descripción válido.');
      return;
    }

    setSaving(true);
    try {
      const quotePayload: Omit<Quote, 'id' | 'created_at' | 'updated_at'> = {
        client_id: clientId,
        title: title.trim(),
        status,
        subtotal,
        discount: actualDiscount,
        tax,
        total,
        notes: notes.trim() || null
      };

      const itemsPayload: Omit<QuoteItem, 'id' | 'quote_id'>[] = validItems.map(item => ({
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }));

      await onSubmit(quotePayload, itemsPayload);
      router.push('/quotes');
    } catch (err: any) {
      console.error('Error guardando cotización:', err);
      setErrorMsg(err.message || 'Ocurrió un error al guardar la cotización.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        Cargando formularios...
      </div>
    );
  }

  return (
    <>
      {/* 1. EDITOR VIEW (HIDDEN ON PRINT) */}
      <div className="space-y-6 no-print">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/quotes')}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Volver"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {isEdit ? 'Editar Cotización' : 'Nueva Cotización'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEdit ? 'Modifica los conceptos y actualiza los cálculos.' : 'Genera una nueva cotización comercial.'}
              </p>
            </div>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer size={14} />
              Imprimir / PDF
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Card */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider border-b border-border pb-2">Información General</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Título de la Cotización</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Propuesta de Automatización Residencia Alfa"
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                    required
                  />
                </div>

                {/* Client Select */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente (Prospecto)</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-medium"
                    required
                  >
                    <option value="">Seleccione un cliente...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name} {lead.company ? `(${lead.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Concepts / Items Table Card */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Conceptos de la Cotización</h3>
                <button
                  type="button"
                  onClick={addBlankItem}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                  Agregar Concepto
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="text-muted-foreground font-semibold border-b border-border/60">
                      <th className="py-2.5 pr-4">Descripción / Concepto</th>
                      <th className="py-2.5 px-2 w-20 text-center">Cant.</th>
                      <th className="py-2.5 px-2 w-36 text-right">Precio Unitario</th>
                      <th className="py-2.5 px-2 w-32 text-right">Importe</th>
                      <th className="py-2.5 pl-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                        {/* Description */}
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItemField(item.id, 'description', e.target.value)}
                            placeholder="Descripción detallada del equipo, servicio o instalación..."
                            className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                            required
                          />
                        </td>
                        
                        {/* Quantity */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemField(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            min="1"
                            className="w-full p-2 text-center rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 font-semibold"
                            required
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 px-2">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-2.5 flex items-center text-muted-foreground">$</span>
                            <input
                              type="number"
                              value={item.unit_price || ''}
                              onChange={(e) => updateItemField(item.id, 'unit_price', Math.max(0, Number(e.target.value)))}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-full pl-6 pr-2 py-2 rounded-lg border border-border bg-background text-foreground text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary/50 font-semibold"
                              required
                            />
                          </div>
                        </td>

                        {/* Row Total */}
                        <td className="py-3 px-2 text-right font-extrabold text-foreground whitespace-nowrap">
                          ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar concepto"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Catalog Product Selector */}
              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
                  <ShoppingBag size={14} className="text-primary/70 shrink-0" />
                  <span className="font-medium">Agregar desde Catálogo:</span>
                  <select
                    onChange={(e) => {
                      handleAddCatalogProduct(e.target.value);
                      e.target.value = ''; // reset select
                    }}
                    defaultValue=""
                    className="p-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer flex-1 sm:w-64 font-medium"
                  >
                    <option value="">Seleccione un producto...</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.sku ? `[${prod.sku}] ` : ''}{prod.name} (${prod.category}) - ${prod.price.toLocaleString('es-MX')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={addBlankItem}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Concepto Manual
                </button>
              </div>
            </div>

            {/* Notes and Conditions */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider border-b border-border pb-2">Condiciones y Notas Comerciales</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Validez de la cotización: 15 días. Condiciones de pago: 60% de anticipo y 40% contra entrega..."
                rows={4}
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed"
              />
            </div>

          </div>

          {/* Sidebar calculations & Status (Right 1 column) */}
          <div className="space-y-6">
            
            {/* Status Select */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider border-b border-border pb-2">Estado de Cotización</h3>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado Actual</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer font-bold"
                >
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
            </div>

            {/* Summary / Calculations Card */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider border-b border-border pb-2">Resumen Financiero</h3>
              
              <div className="space-y-3.5 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-bold text-foreground">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Discount input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descuento Especial ($ MXN)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      placeholder="0.00"
                      min="0"
                      max={subtotal}
                      step="0.01"
                      className="w-full pl-6.5 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold"
                    />
                  </div>
                </div>

                {/* Discount Value Row */}
                {actualDiscount > 0 && (
                  <div className="flex justify-between items-center text-red-400">
                    <span className="font-medium">Descuento Aplicado:</span>
                    <span className="font-bold">-${actualDiscount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Tax (IVA 16%) */}
                <div className="flex justify-between items-center text-muted-foreground border-t border-border/60 pt-3.5">
                  <span className="font-medium">IVA (16%):</span>
                  <span className="font-bold text-foreground">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-sm border-t border-border/80 pt-3.5">
                  <span className="font-extrabold text-foreground">Total Neto:</span>
                  <span className="font-black text-primary text-base">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Cotización'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/quotes')}
                className="w-full px-5 py-3 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* 2. PRINT-FRIENDLY INVOICE VIEW (SHOWN ONLY ON PRINT) */}
      <div className="hidden print:block printable-quote">
        {/* Header Block */}
        <div className="flex justify-between items-start pb-8 border-b-2 border-slate-700">
          <div>
            <div className="flex items-center gap-3">
              {/* Okan logo image */}
              <img src="/logo.png" alt="OkanPro Logo" className="w-14 h-14 object-contain rounded-xl" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-800">OkanPro</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tecnología Premium Residencial</p>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-slate-500 space-y-0.5">
              <p>OkanPro Integraciones S.A. de C.V.</p>
              <p>contacto@okanpro.com | www.okanpro.com</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-700 tracking-tight">COTIZACIÓN</h2>
            <div className="mt-4 space-y-1 text-xs text-slate-700">
              <p><span className="font-bold text-slate-500">Folio:</span> <span className="font-mono font-bold">{initialQuote?.id || 'NUEVA'}</span></p>
              <p><span className="font-bold text-slate-500">Fecha:</span> {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p><span className="font-bold text-slate-500">Estado:</span> <span className="uppercase font-bold">{status}</span></p>
            </div>
          </div>
        </div>

        {/* Client details / Project Title */}
        <div className="grid grid-cols-2 gap-8 py-8">
          {/* Client Details Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Cliente</h3>
            {selectedLead ? (
              <div className="text-xs text-slate-800 space-y-1">
                <p className="font-extrabold text-sm">{selectedLead.first_name} {selectedLead.last_name}</p>
                {selectedLead.company && <p className="font-bold text-slate-600">{selectedLead.company}</p>}
                {selectedLead.email && <p>{selectedLead.email}</p>}
                {selectedLead.phone && <p>{selectedLead.phone}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No se ha especificado cliente</p>
            )}
          </div>

          {/* Project Info Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Proyecto / Propuesta</h3>
            <p className="text-sm font-extrabold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500 mt-2">Integración y configuración de audio multiroom, iluminación arquitectónica, redes de alta velocidad y automatización inteligente.</p>
          </div>
        </div>

        {/* Table of items */}
        <div className="mt-4">
          <table className="w-full border-collapse text-xs text-left print-table">
            <thead>
              <tr className="border-b-2 border-slate-700 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 pr-4">Concepto / Descripción del Equipo o Servicio</th>
                <th className="py-3 px-2 text-center w-16">Cant.</th>
                <th className="py-3 px-2 text-right w-28">P. Unitario</th>
                <th className="py-3 pl-2 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {items.filter(item => item.description.trim() !== '').map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 pr-4 leading-relaxed font-medium">
                    {item.description}
                  </td>
                  <td className="py-3 px-2 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold">
                    ${item.unit_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 pl-2 text-right font-extrabold">
                    ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-5 gap-4 mt-8">
          <div className="col-span-3 text-xs text-slate-500 pr-8 leading-relaxed">
            {notes ? (
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Notas y Términos Comerciales</h4>
                <p className="whitespace-pre-line text-[10px] font-medium leading-normal">{notes}</p>
              </div>
            ) : (
              <p className="text-[9px] italic">Los precios mostrados son en Pesos Mexicanos (MXN). Las condiciones comerciales estándar requieren un anticipo para la adquisición de equipos y liquidación al concluir los trabajos de integración.</p>
            )}
          </div>
          
          <div className="col-span-2 space-y-2.5 text-xs text-slate-700">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Discount */}
            {actualDiscount > 0 && (
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Descuento Especial:</span>
                <span className="font-bold text-slate-800">-${actualDiscount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Tax */}
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>IVA (16%):</span>
              <span className="font-bold text-slate-800">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-sm border-t border-slate-300 pt-2.5 font-bold">
              <span className="text-slate-800 font-black">Total Neto:</span>
              <span className="text-slate-900 font-black text-base">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
          <div>
            <div className="w-40 h-0.5 bg-slate-300 mx-auto mb-2"></div>
            <p className="font-bold">Ing. OkanPro Integraciones</p>
            <p>Representante Técnico Comercial</p>
          </div>
          <div>
            <div className="w-40 h-0.5 bg-slate-300 mx-auto mb-2"></div>
            <p className="font-bold">Aceptación de Presupuesto</p>
            <p>Firma de Cliente Aceptado</p>
          </div>
        </div>
      </div>
    </>
  );
}
