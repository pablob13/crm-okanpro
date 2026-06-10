'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { leadsService } from '@/services/leadsService';
import { opportunitiesService } from '@/services/opportunitiesService';
import { tasksService } from '@/services/tasksService';
import { Lead, Opportunity, Task } from '@/types';
import { 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  CheckSquare, 
  Plus, 
  Briefcase 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedLeads, fetchedOpps, fetchedTasks] = await Promise.all([
          leadsService.getLeads(),
          opportunitiesService.getOpportunities(),
          tasksService.getTasks(),
        ]);
        setLeads(fetchedLeads);
        setOpportunities(fetchedOpps);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cálculos de métricas
  const totalLeads = leads.length;
  
  const pendingTasks = tasks.filter(t => t.status === 'pendiente');
  const totalPendingTasks = pendingTasks.length;

  const activeOpps = opportunities.filter(o => o.stage !== 'ganado' && o.stage !== 'perdido');
  const pipelineValue = activeOpps.reduce((sum, opp) => sum + Number(opp.value), 0);

  const wonOpps = opportunities.filter(o => o.stage === 'ganado');
  const closedWonValue = wonOpps.reduce((sum, opp) => sum + Number(opp.value), 0);

  // Agrupar oportunidades por etapa
  const stagesList = ['lead', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido'];
  const stageStats = stagesList.map(stage => {
    const oppsInStage = opportunities.filter(o => o.stage === stage);
    const count = oppsInStage.length;
    const value = oppsInStage.reduce((sum, o) => sum + Number(o.value), 0);
    return { stage, count, value };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(val);
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Resumen de Operaciones
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Aquí tienes el estado actual de tu pipeline comercial y actividades.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/leads" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all-custom cursor-pointer"
            >
              <Plus size={16} />
              Nuevo Lead
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Leads */}
            <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prospectos Activos</span>
                <p className="text-3xl font-extrabold text-foreground">{totalLeads}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <TrendingUp size={12} />
                  <span>En constante crecimiento</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 text-primary">
                <Users size={24} />
              </div>
            </div>

            {/* Card 2: Pipeline Value */}
            <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor en Pipeline</span>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(pipelineValue)}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{activeOpps.length} tratos activos</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Target size={24} />
              </div>
            </div>

            {/* Card 3: Closed Won */}
            <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ventas Ganadas</span>
                <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(closedWonValue)}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span>{wonOpps.length} oportunidades cerradas</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign size={24} />
              </div>
            </div>

            {/* Card 4: Pending Tasks */}
            <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tareas Pendientes</span>
                <p className="text-3xl font-extrabold text-foreground">{totalPendingTasks}</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-400">
                  <Clock size={12} />
                  <span>Requiere atención hoy</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout (Split Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline Funnel Visualizer */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-sm">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                <h3 className="font-bold text-foreground">Embudo de Ventas (Pipeline)</h3>
              </div>
              <Link href="/pipeline" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Ver Kanban
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 rounded bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stageStats.map(stat => {
                  // Calcular porcentaje
                  const maxVal = Math.max(...stageStats.map(s => s.value)) || 1;
                  const percent = (stat.value / maxVal) * 100;
                  
                  return (
                    <div key={stat.stage} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground capitalize">
                        <span>{stat.stage} ({stat.count})</span>
                        <span className="text-foreground">{formatCurrency(stat.value)}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(percent, stat.count > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Tasks Panel */}
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between shadow-sm">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-amber-500" size={20} />
                <h3 className="font-bold text-foreground">Actividades Próximas</h3>
              </div>
              <Link href="/tasks" className="text-xs text-primary font-semibold hover:underline">
                Ver todo
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 rounded bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Activity size={32} className="text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground font-semibold">¡Todo al día!</p>
                <p className="text-[10px] text-muted-foreground">No tienes tareas pendientes programadas.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                {pendingTasks.slice(0, 4).map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 rounded-xl bg-secondary/30 border border-border flex items-start gap-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      task.priority === 'alta' ? 'bg-red-500' : task.priority === 'media' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{task.title}</p>
                      {task.lead && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {task.lead.first_name} {task.lead.last_name} ({task.lead.company})
                        </p>
                      )}
                      <p className="text-[9px] text-muted-foreground mt-1">
                        Vence: {task.due_date ? new Date(task.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
