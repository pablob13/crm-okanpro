'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { leadsService } from '@/services/leadsService';
import { opportunitiesService } from '@/services/opportunitiesService';
import { Lead, Opportunity, Interaction, InteractionType } from '@/types';
import { 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  MessageSquare,
  X,
  DollarSign,
  TrendingUp,
  Award,
  RefreshCw,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

export default function ClosedClientsPage() {
  const [closedClients, setClosedClients] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Detalle de Cliente seleccionado
  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [newInteractionNotes, setNewInteractionNotes] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<InteractionType>('nota');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const leadsData = await leadsService.getLeads();
      const oppsData = await opportunitiesService.getOpportunities();
      
      // Obtener IDs de leads que tienen oportunidades ganadas
      const wonLeadIds = new Set(
        oppsData
          .filter(opp => opp.stage === 'ganado')
          .map(opp => opp.lead_id)
      );
      
      // Filtrar leads convertidos que tienen negocios ganados
      const clientsList = leadsData.filter(lead => 
        lead.status === 'convertido' && wonLeadIds.has(lead.id)
      );
      
      setClosedClients(clientsList);
      setOpportunities(oppsData);
    } catch (err) {
      console.error('Error cargando modulo de clientes cerrados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async (clientId: string) => {
    setLoadingInteractions(true);
    try {
      const data = await leadsService.getInteractions(clientId);
      setInteractions(data);
    } catch (err) {
      console.error('Error cargando interacciones del cliente:', err);
    } finally {
      setLoadingInteractions(false);
    }
  };

  const handleSelectClient = (client: Lead) => {
    setSelectedClient(client);
    loadInteractions(client.id);
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newInteractionNotes.trim()) return;

    try {
      const newInt = await leadsService.addInteraction(
        selectedClient.id,
        newInteractionNotes,
        newInteractionType
      );
      setInteractions([newInt, ...interactions]);
      setNewInteractionNotes('');
    } catch (err) {
      console.error('Error agregando nota de cliente:', err);
    }
  };

  // Obtener negocios ganados de un cliente
  const getClientWonDeals = (clientId: string) => {
    return opportunities.filter(opp => opp.lead_id === clientId && opp.stage === 'ganado');
  };

  // Obtener el valor total ganado de un cliente
  const getClientWonValue = (clientId: string) => {
    return getClientWonDeals(clientId).reduce((acc, curr) => acc + curr.value, 0);
  };

  // Filtrado de clientes por busqueda
  const filteredClients = closedClients.filter(client => {
    const wonDeals = getClientWonDeals(client.id);
    const matchesSearch = 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (client.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(search.toLowerCase()) ||
      wonDeals.some(opp => opp.title.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  // Metricas Generales
  const totalClientsCount = closedClients.length;
  const totalBilling = closedClients.reduce((acc, curr) => acc + getClientWonValue(curr.id), 0);
  const totalWonDeals = opportunities.filter(opp => opp.stage === 'ganado').length;
  const averageDealValue = totalWonDeals > 0 ? totalBilling / totalWonDeals : 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera del modulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Clientes Cerrados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Seguimiento post-venta y control de proyectos finalizados o en curso de instalacion.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tarjetas de Metricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clientes Cerrados */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clientes con Ventas</span>
              <p className="text-xl font-extrabold text-foreground">{totalClientsCount}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users size={20} />
            </div>
          </div>

          {/* Card 2: Monto Total Ganado */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monto Cerrado</span>
              <p className="text-xl font-extrabold text-emerald-400">${totalBilling.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Card 3: Proyectos Ganados */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proyectos Ganados</span>
              <p className="text-xl font-extrabold text-sky-400">{totalWonDeals}</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <Award size={20} />
            </div>
          </div>

          {/* Card 4: Ticket Promedio de Contrato */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ticket Promedio Contrato</span>
              <p className="text-xl font-extrabold text-violet-400">${averageDealValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Panel de Listado e Interacciones */}
        <div className="flex flex-col lg:flex-row gap-6 relative min-h-[400px]">
          
          {/* Columna Principal - Lista */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            {/* Buscador */}
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, empresa o nombre de proyecto..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Listado */}
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="space-y-3 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-secondary/35 border border-border animate-pulse" />
                  ))}
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No se encontraron clientes con contratos ganados.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map(client => {
                    const isSelected = selectedClient?.id === client.id;
                    const wonValue = getClientWonValue(client.id);
                    const wonDeals = getClientWonDeals(client.id);
                    
                    return (
                      <div
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5' 
                            : 'border-border bg-background/30 hover:bg-secondary/20'
                        }`}
                      >
                        {/* Info Principal */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center shrink-0 select-none">
                            {client.first_name[0]}{client.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground truncate">{client.first_name} {client.last_name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5 max-w-[280px]">
                              {wonDeals.map(d => d.title).join(', ')}
                            </p>
                          </div>
                        </div>

                        {/* Metricas de Cuenta */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-muted-foreground">Monto Acumulado</p>
                            <p className="font-extrabold text-foreground mt-0.5">
                              ${wonValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {wonDeals.length} {wonDeals.length === 1 ? 'Proyecto' : 'Proyectos'}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Slide-over de detalles de cliente cerrado */}
          {selectedClient && (
            <div className="w-full lg:w-96 flex flex-col bg-card border border-border rounded-2xl shadow-lg overflow-hidden shrink-0 animate-slide-in h-[500px] lg:h-auto z-20 relative">
              {/* Cabecera */}
              <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center h-14">
                <span className="font-bold text-xs">Seguimiento Post-Venta</span>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Perfil */}
                <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-xl font-black flex items-center justify-center shadow-md">
                    {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{selectedClient.first_name} {selectedClient.last_name}</h3>
                    {selectedClient.company && <p className="text-xs text-primary font-semibold">{selectedClient.company}</p>}
                  </div>
                </div>

                {/* Lista de Proyectos Ganados */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proyectos de Integracion</h4>
                  <div className="space-y-2">
                    {getClientWonDeals(selectedClient.id).map(deal => (
                      <div key={deal.id} className="p-3 bg-secondary/20 rounded-xl border border-border/60">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-foreground text-xs leading-snug">{deal.title}</p>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            Ganado
                          </span>
                        </div>
                        <div className="mt-2.5 flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-foreground">${deal.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          {deal.close_date && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(deal.close_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contacto</h4>
                  {selectedClient.email && (
                    <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors py-0.5">
                      <Mail size={13} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{selectedClient.email}</span>
                    </a>
                  )}
                  {selectedClient.phone && (
                    <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors py-0.5">
                      <Phone size={13} className="text-muted-foreground shrink-0" />
                      <span>{selectedClient.phone}</span>
                    </a>
                  )}
                </div>

                {/* Formulario de Notas Post-Venta */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-primary">Registrar Servicio Post-Venta</h4>
                  
                  <form onSubmit={handleAddInteraction} className="space-y-2">
                    <textarea
                      value={newInteractionNotes}
                      onChange={(e) => setNewInteractionNotes(e.target.value)}
                      placeholder="Registrar estatus de entrega, programacion de audio, configuracion Lutron..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs transition-all resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <select
                        value={newInteractionType}
                        onChange={(e) => setNewInteractionType(e.target.value as InteractionType)}
                        className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer font-semibold"
                      >
                        <option value="nota">Nota de Servicio</option>
                        <option value="llamada">Llamada de Soporte</option>
                        <option value="reunion">Visita Tecnica</option>
                        <option value="correo">Seguimiento Mail</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!newInteractionNotes.trim()}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[10px] shadow-sm hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Guardar Log
                      </button>
                    </div>
                  </form>

                  {/* Historial Post-Venta */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={11} />
                      Historial de Soporte y Servicio
                    </h4>
                    {loadingInteractions ? (
                      <div className="space-y-2 py-2">
                        <div className="h-10 rounded bg-secondary animate-pulse" />
                        <div className="h-10 rounded bg-secondary animate-pulse" />
                      </div>
                    ) : interactions.length === 0 ? (
                      <p className="text-[9px] text-muted-foreground text-center py-4">No hay notas registradas para este cliente.</p>
                    ) : (
                      <div className="space-y-3">
                        {interactions.map(int => (
                          <div key={int.id} className="relative flex gap-2 text-[11px]">
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                                <MessageSquare size={10} className="text-muted-foreground" />
                              </div>
                              <div className="w-0.5 flex-1 bg-border mt-1" />
                            </div>
                            <div className="flex-1 bg-secondary/20 border border-border/70 p-2.5 rounded-xl min-w-0">
                              <div className="flex justify-between items-center mb-1 text-[9px]">
                                <span className="font-bold text-foreground capitalize">{int.type}</span>
                                <span className="text-muted-foreground">
                                  {new Date(int.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed break-words">{int.notes}</p>
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

      </div>
    </AppLayout>
  );
}
