'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { tasksService } from '@/services/tasksService';
import { leadsService } from '@/services/leadsService';
import { Task, TaskType, TaskPriority, TaskStatus, Lead } from '@/types';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  X,
  Phone,
  Mail,
  Users,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'completada'>('pendiente');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario Tarea
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'llamada' as TaskType,
    priority: 'media' as TaskPriority,
    due_date: '',
    lead_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, leadsData] = await Promise.all([
        tasksService.getTasks(),
        leadsService.getLeads(),
      ]);
      setTasks(tasksData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Error cargando tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (id: string) => {
    // Actualizar de forma optimista
    setTasks(prev => 
      prev.map(t => t.id === id ? { ...t, status: t.status === 'pendiente' ? 'completada' : 'pendiente' } : t)
    );

    try {
      await tasksService.toggleTaskStatus(id);
    } catch (err) {
      console.error('Error cambiando estado de la tarea:', err);
      // Revertir
      loadData();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      await tasksService.createTask({
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        lead_id: formData.lead_id || null,
        status: 'pendiente',
        assigned_to: null
      });

      // Recargar para traer relaciones completas
      loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creando tarea:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      await tasksService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error eliminando tarea:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'llamada',
      priority: 'media',
      due_date: '',
      lead_id: ''
    });
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'llamada': return <Phone size={14} className="text-blue-400" />;
      case 'correo': return <Mail size={14} className="text-purple-400" />;
      case 'reunion': return <Users size={14} className="text-emerald-400" />;
      case 'tarea': return <CheckSquare size={14} className="text-amber-400" />;
      default: return <CheckSquare size={14} />;
    }
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'media': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'baja': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // Filtrado de tareas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'todos' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-8.5rem)] gap-6">
        
        {/* Left Side: Filter sidebar */}
        <div className="w-full md:w-64 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-6 shrink-0 h-fit">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground text-sm">Filtros de Tareas</h3>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="md:hidden p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Status Filter buttons */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Estado</label>
            {(['pendiente', 'completada', 'todos'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {status === 'todos' ? 'Todas las tareas' : `${status}s`}
              </button>
            ))}
          </div>

          {/* Priority filter selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="todos">Cualquier prioridad</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Main tasks list */}
        <div className="flex-1 flex flex-col min-w-0 bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Lista de Tareas</h2>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus size={16} />
              Crear Tarea
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
            />
          </div>

          {/* Tasks Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-4 py-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse border border-border" />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                <AlertCircle size={40} className="text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No hay tareas programadas</p>
                <p className="text-xs text-muted-foreground/80">Disfruta tu día libre o añade una nueva actividad.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.status === 'completada'
                        ? 'border-border bg-secondary/10 opacity-75'
                        : 'border-border bg-background/30 hover:bg-secondary/15'
                    }`}
                  >
                    {/* Status Toggle Box */}
                    <button
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                    >
                      {task.status === 'completada' ? (
                        <CheckSquare className="text-primary" size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 font-bold text-xs text-foreground capitalize">
                          {getTaskIcon(task.type)}
                          {task.type}
                        </span>
                        
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold text-foreground mt-1.5 leading-snug ${task.status === 'completada' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">{task.description}</p>
                      )}

                      {/* Associated details */}
                      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                        {task.due_date && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock size={11} />
                            Vence: {new Date(task.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}

                        {task.lead && (
                          <span className="flex items-center gap-1.5 font-medium truncate max-w-xs">
                            <Users size={11} />
                            Asociado: {task.lead.first_name} {task.lead.last_name} ({task.lead.company || 'Sin Empresa'})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Eliminar tarea"
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer shrink-0 align-self-start"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl animate-fade-in relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-4">Crear Nueva Tarea</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Título de la Actividad</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej. Enviar propuesta revisada"
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ej. Especificaciones de la cotización y descuento adicional del 5%..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="llamada">Llamada</option>
                    <option value="correo">Correo</option>
                    <option value="reunion">Reunión</option>
                    <option value="tarea">Tarea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vencer el / Hora</label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vincular Prospecto</label>
                  <select
                    value={formData.lead_id}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  >
                    <option value="">Ninguno</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name} ({lead.company || 'Sin Empresa'})
                      </option>
                    ))}
                  </select>
                </div>
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
                  Crear Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
