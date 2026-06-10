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
  Briefcase
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Lead[]>([]);
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
      
      // Filtrar leads con estado 'convertido' para obtener los clientes
      const convertedClients = leadsData.filter(lead => lead.status === 'convertido');
      
      setClients(convertedClients);
      setOpportunities(oppsData);
    } catch (err) {
      console.error('Error cargando modulo de clientes:', err);
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

  // Metodo para obtener el valor total ganado de un cliente
  const getClientWonValue = (clientId: string) => {
    return opportunities
      .filter(opp => opp.lead_id === clientId && opp.stage === 'ganado')
      .reduce((acc, curr) => acc + curr.value, 0);
  };

  // Metodo para contar negocios cerrados
  const getClientWonCount = (clientId: string) => {
    return opportunities.filter(opp => opp.lead_id === clientId && opp.stage === 'ganado').length;
  };

  // Filtrado de clientes por busqueda
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (client.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Metricas Generales
  const totalClientsCount = clients.length;
  const totalBilling = clients.reduce((acc, curr) => acc + getClientWonValue(curr.id), 0);
  const averageTicket = totalClientsCount > 0 ? totalBilling / totalClientsCount : 0;
  const totalDealsClosed = opportunities.filter(opp => opp.stage === 'ganado').length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Cabecera del modulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Cartera de Clientes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Visualiza y gestiona las relaciones con las cuentas y prospectos convertidos.</p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer self-start sm:self-center"
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tarjetas de Metricas de Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clientes */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clientes Convertidos</span>
              <p className="text-xl font-extrabold text-foreground">{totalClientsCount}</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users size={20} />
            </div>
          </div>

          {/* Card 2: Facturación Total */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monto Facturado</span>
              <p className="text-xl font-extrabold text-emerald-400">${totalBilling.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Card 3: Ticket Promedio */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Valor Promedio Cuenta</span>
              <p className="text-xl font-extrabold text-sky-400">${averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>

          {/* Card 4: Contratos Cerrados */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contratos Ganados</span>
              <p className="text-xl font-extrabold text-violet-400">{totalDealsClosed}</p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <Award size={20} />
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
                placeholder="Buscar cliente por nombre, empresa o correo..."
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
                  No se encontraron clientes convertidos.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map(client => {
                    const isSelected = selectedClient?.id === client.id;
                    const wonValue = getClientWonValue(client.id);
                    const wonCount = getClientWonCount(client.id);
                    
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-sky-500 text-white font-bold flex items-center justify-center shrink-0 select-none">
                            {client.first_name[0]}{client.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground truncate">{client.first_name} {client.last_name}</h4>
                            {client.company && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 size={11} />
                                {client.company}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metricas de Cuenta */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border shrink-0">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] text-muted-foreground">Valor de Cuenta</p>
                            <p className="font-extrabold text-foreground mt-0.5">
                              ${wonValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {wonCount} {wonCount === 1 ? 'Contrato' : 'Contratos'}
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

          {/* Slide-over de detalles de cliente */}
          {selectedClient && (
            <div className="w-full lg:w-96 flex flex-col bg-card border border-border rounded-2xl shadow-lg overflow-hidden shrink-0 animate-slide-in h-[500px] lg:h-auto z-20 relative">
              {/* Cabecera */}
              <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center h-14">
                <span className="font-bold text-xs">Ficha del Cliente</span>
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white text-xl font-black flex items-center justify-center shadow-md">
                    {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{selectedClient.first_name} {selectedClient.last_name}</h3>
                    {selectedClient.company && <p className="text-xs text-primary font-semibold">{selectedClient.company}</p>}
                  </div>
                </div>

                {/* Metricas especificas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Facturado</p>
                    <p className="font-extrabold text-foreground text-xs mt-1">
                      ${getClientWonValue(selectedClient.id).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Negocios Cerrados</p>
                    <p className="font-extrabold text-foreground text-xs mt-1">
                      {getClientWonCount(selectedClient.id)} contratos
                    </p>
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

                {/* Notas de Seguimiento */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seguimiento y Notas</h4>
                  
                  <form onSubmit={handleAddInteraction} className="space-y-2">
                    <textarea
                      value={newInteractionNotes}
                      onChange={(e) => setNewInteractionNotes(e.target.value)}
                      placeholder="Registra una nueva llamada o nota de servicio..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs transition-all resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <select
                        value={newInteractionType}
                        onChange={(e) => setNewInteractionType(e.target.value as InteractionType)}
                        className="px-2 py-1 rounded-lg border border-border bg-background text-foreground text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                      >
                        <option value="nota">Nota de Servicio</option>
                        <option value="llamada">Llamada</option>
                        <option value="correo">Correo</option>
                        <option value="reunion">Reunión</option>
                      </select>
                      <button
                        type="submit"
                        disabled={!newInteractionNotes.trim()}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-[10px] shadow-sm hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Añadir Nota
                      </button>
                    </div>
                  </form>

                  {/* Linea de tiempo */}
                  <div className="space-y-3 pt-2">
                    {loadingInteractions ? (
                      <div className="space-y-2 py-2">
                        <div className="h-10 rounded bg-secondary animate-pulse" />
                        <div className="h-10 rounded bg-secondary animate-pulse" />
                      </div>
                    ) : interactions.length === 0 ? (
                      <p className="text-[9px] text-muted-foreground text-center py-4">No hay logs de seguimiento.</p>
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
