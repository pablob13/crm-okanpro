'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { leadsService } from '@/services/leadsService';
import { opportunitiesService } from '@/services/opportunitiesService';
import { Lead, Interaction, InteractionType, LeadStatus } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Building2, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ChevronRight,
  MessageSquare,
  X,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  
  // Detalle de Prospecto seleccionado
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [newInteractionNotes, setNewInteractionNotes] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<InteractionType>('nota');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Formulario de Lead
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    status: 'nuevo' as LeadStatus,
    source: 'directo'
  });

  // Oportunidad rápida desde el Lead
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppFormData, setOppFormData] = useState({
    title: '',
    value: '',
    stage: 'lead'
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Error cargando prospectos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async (leadId: string) => {
    setLoadingInteractions(true);
    try {
      const data = await leadsService.getInteractions(leadId);
      setInteractions(data);
    } catch (err) {
      console.error('Error cargando interacciones:', err);
    } finally {
      setLoadingInteractions(false);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    loadInteractions(lead.id);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLead = await leadsService.createLead({
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company || null,
        email: formData.email || null,
        phone: formData.phone || null,
        status: formData.status,
        source: formData.source,
        assigned_to: null,
        created_by: null
      });

      setLeads([newLead, ...leads]);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creando prospecto:', err);
    }
  };

  const handleEditLeadClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setFormData({
      first_name: lead.first_name,
      last_name: lead.last_name,
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status,
      source: lead.source
    });
    setShowCreateModal(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    
    try {
      const updated = await leadsService.updateLead(editingLead.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company || null,
        email: formData.email || null,
        phone: formData.phone || null,
        status: formData.status,
        source: formData.source
      });

      setLeads(leads.map(l => l.id === updated.id ? updated : l));
      if (selectedLead?.id === updated.id) {
        setSelectedLead(updated);
      }
      setShowCreateModal(false);
      setEditingLead(null);
      resetForm();
    } catch (err) {
      console.error('Error actualizando prospecto:', err);
    }
  };

  const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar este prospecto? Se eliminarán todas sus cotizaciones, tareas e interacciones.')) return;
    
    try {
      await leadsService.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Error eliminando prospecto:', err);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newInteractionNotes.trim()) return;

    try {
      const newInt = await leadsService.addInteraction(
        selectedLead.id,
        newInteractionNotes,
        newInteractionType
      );
      setInteractions([newInt, ...interactions]);
      setNewInteractionNotes('');
    } catch (err) {
      console.error('Error agregando interacción:', err);
    }
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !oppFormData.title.trim() || !oppFormData.value) return;

    try {
      await opportunitiesService.createOpportunity({
        title: oppFormData.title,
        value: parseFloat(oppFormData.value),
        stage: oppFormData.stage as any,
        close_date: null,
        lead_id: selectedLead.id,
        assigned_to: null
      });

      // Auto-actualizar estado de lead a 'convertido' si se gana
      if (oppFormData.stage === 'ganado') {
        const updatedLead = { ...selectedLead, status: 'convertido' as LeadStatus };
        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));
      }

      setShowOppModal(false);
      setOppFormData({ title: '', value: '', stage: 'lead' });
      
      // Registrar interacción automática
      const note = `Oportunidad creada: "${oppFormData.title}" por un valor de $${oppFormData.value} MXN.`;
      const newInt = await leadsService.addInteraction(selectedLead.id, note, 'nota');
      setInteractions([newInt, ...interactions]);
    } catch (err) {
      console.error('Error creando oportunidad:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      company: '',
      email: '',
      phone: '',
      status: 'nuevo',
      source: 'directo'
    });
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'nuevo': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'contactado': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'calificado': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'convertido': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'perdido': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // Filtrado de prospectos
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === 'todos' || lead.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5rem)] gap-6 relative">
        
        {/* Main List Section */}
        <div className={`flex-1 flex flex-col min-w-0 bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden transition-all-custom`}>
          {/* Header controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Lista de Prospectos</h2>
            <button
              onClick={() => { resetForm(); setEditingLead(null); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Agregar Prospecto
            </button>
          </div>

          {/* Search and Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, empresa, correo..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="todos">Todos los Estados</option>
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="calificado">Calificado</option>
                <option value="convertido">Convertido</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-4 py-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-secondary/30 animate-pulse border border-border" />
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                <Building2 size={40} className="text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No se encontraron prospectos</p>
                <p className="text-xs text-muted-foreground/80">Intenta cambiar la búsqueda o el filtro de estado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedLead?.id === lead.id 
                        ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5' 
                        : 'border-border bg-background/30 hover:bg-secondary/20'
                    }`}
                  >
                    {/* User Profile / Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-bold border border-border shrink-0 select-none">
                        {lead.first_name[0]}{lead.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">{lead.first_name} {lead.last_name}</h4>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <Building2 size={12} />
                            {lead.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${getStatusBadgeClass(lead.status)}`}>
                        {lead.status}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleEditLeadClick(lead, e)}
                          title="Editar"
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLead(lead.id, e)}
                          title="Eliminar"
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lead Detail Slide-over Panel */}
        {selectedLead && (
          <div className="w-full lg:w-96 flex flex-col bg-card border border-border rounded-2xl shadow-lg overflow-hidden shrink-0 animate-slide-in h-[calc(100vh-8.5rem)] absolute lg:relative inset-0 lg:inset-auto z-30">
            {/* Drawer Header */}
            <div className="p-5 border-b border-border bg-background/50 flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-bold text-sm truncate">Detalles del Lead</span>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-border">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white text-2xl font-black border border-primary/20 shadow-md">
                  {selectedLead.first_name[0]}{selectedLead.last_name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">{selectedLead.first_name} {selectedLead.last_name}</h3>
                  {selectedLead.company && <p className="text-sm text-primary font-semibold">{selectedLead.company}</p>}
                </div>
                
                {/* Oportunidad rápida */}
                <button
                  onClick={() => setShowOppModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-primary text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign size={12} />
                  Crear Oportunidad
                </button>
              </div>

              {/* Information List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Información de Contacto</h4>
                
                {selectedLead.email && (
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2.5 text-xs text-foreground hover:text-primary transition-colors py-1">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="truncate">{selectedLead.email}</span>
                  </a>
                )}
                
                {selectedLead.phone && (
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2.5 text-xs text-foreground hover:text-primary transition-colors py-1">
                    <Phone size={14} className="text-muted-foreground" />
                    <span>{selectedLead.phone}</span>
                  </a>
                )}

                <div className="flex items-center gap-2.5 text-xs text-foreground py-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14">Origen:</span>
                  <span className="capitalize">{selectedLead.source}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-foreground py-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-14">Estado:</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
              </div>

              {/* Interaction Timeline */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Historial de Interacciones</h4>
                
                {/* Notes Input Form */}
                <form onSubmit={handleAddInteraction} className="space-y-2">
                  <textarea
                    value={newInteractionNotes}
                    onChange={(e) => setNewInteractionNotes(e.target.value)}
                    placeholder="Registra una nueva interacción o nota..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={newInteractionType}
                      onChange={(e) => setNewInteractionType(e.target.value as InteractionType)}
                      className="px-2 py-1 rounded-lg border border-border bg-background/50 text-foreground text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    >
                      <option value="nota">Nota</option>
                      <option value="llamada">Llamada</option>
                      <option value="correo">Correo</option>
                      <option value="reunion">Reunión</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!newInteractionNotes.trim()}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[10px] shadow-sm hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </form>

                {/* Timeline Items */}
                <div className="space-y-3 pt-2">
                  {loadingInteractions ? (
                    <div className="space-y-2 py-2">
                      <div className="h-10 rounded bg-secondary animate-pulse" />
                      <div className="h-10 rounded bg-secondary animate-pulse" />
                    </div>
                  ) : interactions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-4">No hay interacciones registradas aún.</p>
                  ) : (
                    <div className="space-y-4">
                      {interactions.map(int => (
                        <div key={int.id} className="relative flex gap-3 text-xs">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                              <MessageSquare size={12} className="text-muted-foreground" />
                            </div>
                            <div className="w-0.5 flex-1 bg-border mt-1" />
                          </div>
                          {/* Timeline notes */}
                          <div className="flex-1 bg-secondary/35 border border-border p-3 rounded-xl min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-foreground capitalize text-[10px]">{int.type}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(int.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-relaxed break-words">{int.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LEAD CREATION / EDITION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl animate-fade-in relative">
            <button
              onClick={() => { setShowCreateModal(false); setEditingLead(null); }}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-4">
              {editingLead ? 'Editar Prospecto' : 'Agregar Nuevo Prospecto'}
            </h3>

            <form onSubmit={editingLead ? handleUpdateLead : handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Juan"
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Pérez"
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Empresa</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="OkanPro Industrial"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@empresa.com"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="contactado">Contactado</option>
                    <option value="calificado">Calificado</option>
                    <option value="convertido">Convertido</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Origen</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="directo">Directo</option>
                    <option value="web">Sitio Web</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="campaña">Campaña Publicitaria</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditingLead(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  {editingLead ? 'Guardar Cambios' : 'Crear Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK OPPORTUNITY MODAL FROM DETAILED DRAWER */}
      {showOppModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl animate-fade-in relative">
            <button
              onClick={() => setShowOppModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-foreground mb-4">
              Crear Oportunidad para {selectedLead.first_name}
            </h3>

            <form onSubmit={handleCreateOpp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Título de Oportunidad</label>
                <input
                  type="text"
                  required
                  value={oppFormData.title}
                  onChange={(e) => setOppFormData({ ...oppFormData, title: e.target.value })}
                  placeholder="ej. Suministro Material Eléctrico"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Valor Estimado ($ MXN)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={oppFormData.value}
                  onChange={(e) => setOppFormData({ ...oppFormData, value: e.target.value })}
                  placeholder="50000"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Etapa Inicial</label>
                <select
                  value={oppFormData.stage}
                  onChange={(e) => setOppFormData({ ...oppFormData, stage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="lead">Lead / Prospecto</option>
                  <option value="contactado">Contactado</option>
                  <option value="propuesta">Propuesta Enviada</option>
                  <option value="negociacion">Negociación</option>
                  <option value="ganado">Ganado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOppModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Crear Negocio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
