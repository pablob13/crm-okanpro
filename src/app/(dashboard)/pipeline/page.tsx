'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { opportunitiesService } from '@/services/opportunitiesService';
import { leadsService } from '@/services/leadsService';
import { Opportunity, OpportunityStage, Lead } from '@/types';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Building2, 
  User, 
  X,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Definición de las etapas del Kanban
const KANBAN_STAGES: { id: OpportunityStage; title: string; color: string }[] = [
  { id: 'lead', title: 'Lead / Prospecto', color: 'border-t-blue-500 bg-blue-500/5' },
  { id: 'contactado', title: 'Contactado', color: 'border-t-purple-500 bg-purple-500/5' },
  { id: 'propuesta', title: 'Propuesta Enviada', color: 'border-t-amber-500 bg-amber-500/5' },
  { id: 'negociacion', title: 'En Negociación', color: 'border-t-indigo-500 bg-indigo-500/5' },
  { id: 'ganado', title: 'Ganado (Cerrado)', color: 'border-t-emerald-500 bg-emerald-500/5' },
  { id: 'perdido', title: 'Perdido (Cerrado)', color: 'border-t-red-500 bg-red-500/5' },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Formulario Oportunidad
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'lead' as OpportunityStage,
    lead_id: '',
    close_date: ''
  });

  // Arrastrar y Soltar
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oppsData, leadsData] = await Promise.all([
        opportunitiesService.getOpportunities(),
        leadsService.getLeads(),
      ]);
      setOpportunities(oppsData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Error cargando pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: OpportunityStage) => {
    if (!draggingId) return;
    
    // Obtener la oportunidad antes de cambiar
    const oppToUpdate = opportunities.find(o => o.id === draggingId);
    if (!oppToUpdate) return;
    
    const previousStage = oppToUpdate.stage;
    if (previousStage === stage) return; // Sin cambios

    // Actualizar de forma optimista
    setOpportunities(prev => 
      prev.map(o => o.id === draggingId ? { ...o, stage } : o)
    );

    try {
      await opportunitiesService.updateOpportunityStage(draggingId, stage);
      
      // Si cambia a "ganado", ¡lanzar confeti!
      if (stage === 'ganado') {
        triggerConfetti();
        // Logear interacción en el Lead automáticamente
        const note = `Oportunidad "${oppToUpdate.title}" marcada como GANADA.`;
        await leadsService.addInteraction(oppToUpdate.lead_id, note, 'nota');
      } else if (stage === 'perdido') {
        const note = `Oportunidad "${oppToUpdate.title}" marcada como PERDIDA.`;
        await leadsService.addInteraction(oppToUpdate.lead_id, note, 'nota');
      }
    } catch (err) {
      console.error('Error actualizando etapa de oportunidad:', err);
      // Revertir en caso de error
      setOpportunities(prev => 
        prev.map(o => o.id === draggingId ? { ...o, stage: previousStage } : o)
      );
    } finally {
      setDraggingId(null);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6']
    });
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id || !formData.title || !formData.value) return;

    try {
      const newOpp = await opportunitiesService.createOpportunity({
        title: formData.title,
        value: parseFloat(formData.value),
        stage: formData.stage,
        close_date: formData.close_date || null,
        lead_id: formData.lead_id,
        assigned_to: null
      });

      // Recargar datos para traer la relación del Lead completa
      loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creando oportunidad:', err);
    }
  };

  const handleDeleteOpp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar esta oportunidad comercial?')) return;
    
    try {
      await opportunitiesService.deleteOpportunity(id);
      setOpportunities(opportunities.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error eliminando oportunidad:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      value: '',
      stage: 'lead',
      lead_id: '',
      close_date: ''
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calcular el total de valor por columna
  const getStageTotalValue = (stage: OpportunityStage) => {
    return opportunities
      .filter(o => o.stage === stage)
      .reduce((sum, o) => sum + Number(o.value), 0);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-6">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Embudo Comercial (Kanban)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Arrastra y suelta los tratos comerciales para cambiar su etapa.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Crear Oportunidad
          </button>
        </div>

        {/* Kanban Board Layout */}
        <div 
          style={{ transform: 'rotateX(180deg)' }}
          className="flex-1 flex gap-4 overflow-x-auto pb-4 pr-1 scrollbar-thin select-none"
        >
          {KANBAN_STAGES.map(stage => {
            const stageOpps = opportunities.filter(o => o.stage === stage.id);
            const totalVal = getStageTotalValue(stage.id);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
                style={{ transform: 'rotateX(180deg)' }}
                className={`w-72 rounded-2xl border border-border flex flex-col shrink-0 overflow-hidden ${stage.color} border-t-4 transition-colors duration-200`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-border bg-card/65 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate">{stage.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {stageOpps.length}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-foreground mt-1">
                    {formatCurrency(totalVal)}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-28 rounded-xl bg-secondary/35 animate-pulse border border-border" />
                      ))}
                    </div>
                  ) : stageOpps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-6 text-muted-foreground/30">
                      <Target size={24} />
                    </div>
                  ) : (
                    stageOpps.map(opp => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp.id)}
                        className={`p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing ${
                          draggingId === opp.id ? 'opacity-50 scale-95 border-dashed border-primary' : ''
                        }`}
                      >
                        {/* Opp Title & Delete */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{opp.title}</h4>
                          <button
                            onClick={(e) => handleDeleteOpp(opp.id, e)}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Value */}
                        <p className="text-sm font-extrabold text-foreground mt-2">{formatCurrency(opp.value)}</p>

                        {/* Associated Lead Name */}
                        {opp.lead && (
                          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground truncate">
                            <Building2 size={10} className="shrink-0" />
                            <span className="font-medium truncate">{opp.lead.first_name} {opp.lead.last_name}</span>
                          </div>
                        )}

                        {/* Close Date */}
                        {opp.close_date && (
                          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                            <Calendar size={10} className="shrink-0" />
                            <span>Cierre: {new Date(opp.close_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl animate-fade-in relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-4">Nueva Oportunidad Comercial</h3>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Título de la Oportunidad</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej. Sistema de Audio Sonos y Luces Lutron"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vincular a Prospecto (Lead)</label>
                <select
                  required
                  value={formData.lead_id}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="">Selecciona un Prospecto...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} ({lead.company || 'Sin Empresa'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Valor ($ MXN)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="120000"
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Etapa Comercial</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as OpportunityStage })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="lead">Lead</option>
                    <option value="contactado">Contactado</option>
                    <option value="propuesta">Propuesta</option>
                    <option value="negociacion">Negociación</option>
                    <option value="ganado">Ganado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fecha de Cierre Estimada</label>
                <input
                  type="date"
                  value={formData.close_date}
                  onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Crear Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
