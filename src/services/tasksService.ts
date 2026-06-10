import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Task, TaskStatus } from '@/types';
import { mockDb } from './mockData';

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, lead:leads(*), assigned_profile:profiles(*)')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } else {
      const tasks = mockDb.getTasks();
      const leads = mockDb.getLeads();
      return tasks.map(task => ({
        ...task,
        lead: leads.find(l => l.id === task.lead_id) || undefined,
      }));
    }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const tasks = mockDb.getTasks();
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveTasks([...tasks, newTask]);
      return newTask;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const tasks = mockDb.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarea no encontrada');
      
      const updatedTask = {
        ...tasks[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      tasks[index] = updatedTask;
      mockDb.saveTasks(tasks);
      return updatedTask;
    }
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      // Primero obtener el estado actual
      const { data: current, error: getError } = await supabase
        .from('tasks')
        .select('status')
        .eq('id', id)
        .single();
      
      if (getError) throw getError;
      
      const nextStatus = current.status === 'pendiente' ? 'completada' : 'pendiente';
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const tasks = mockDb.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tarea no encontrada');
      
      const nextStatus: TaskStatus = tasks[index].status === 'pendiente' ? 'completada' : 'pendiente';
      
      const updatedTask = {
        ...tasks[index],
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      
      tasks[index] = updatedTask;
      mockDb.saveTasks(tasks);
      return updatedTask;
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const tasks = mockDb.getTasks();
      const filtered = tasks.filter(t => t.id !== id);
      mockDb.saveTasks(filtered);
    }
  }
};
