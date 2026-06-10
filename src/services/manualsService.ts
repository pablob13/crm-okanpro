import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Manual } from '@/types';
import { mockDb } from './mockData';

export const manualsService = {
  async getManuals(): Promise<Manual[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getManuals();
    }
  },

  async getManualById(id: string): Promise<Manual> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const manuals = mockDb.getManuals();
      const manual = manuals.find(m => m.id === id);
      if (!manual) throw new Error('Manual no encontrado');
      return manual;
    }
  },

  async createManual(manual: Omit<Manual, 'id' | 'created_at' | 'updated_at'>): Promise<Manual> {
    const id = isSupabaseConfigured && supabase 
      ? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'man-' + Math.random().toString(36).substring(2, 15))
      : `man-${Date.now()}`;
      
    const isInternalDoc = manual.content !== undefined && manual.content !== null;
    const finalFileUrl = isInternalDoc ? `/manuals/share/${id}` : manual.file_url;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('manuals')
        .insert([{
          id,
          ...manual,
          file_url: finalFileUrl
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const manuals = mockDb.getManuals();
      const newManual: Manual = {
        ...manual,
        id,
        file_url: finalFileUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveManuals([newManual, ...manuals]);
      return newManual;
    }
  },

  async updateManual(id: string, updates: Partial<Manual>): Promise<Manual> {
    // Si se actualizó el contenido (es un manual interno), actualizamos su file_url para apuntar a la ruta interna
    let finalUpdates = { ...updates };
    if (updates.content !== undefined && updates.content !== null) {
      finalUpdates.file_url = `/manuals/share/${id}`;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('manuals')
        .update({ ...finalUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const manuals = mockDb.getManuals();
      const index = manuals.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Manual no encontrado');
      
      const updatedManual = {
        ...manuals[index],
        ...finalUpdates,
        updated_at: new Date().toISOString(),
      };
      
      manuals[index] = updatedManual;
      mockDb.saveManuals(manuals);
      return updatedManual;
    }
  },

  async deleteManual(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('manuals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const manuals = mockDb.getManuals();
      const filtered = manuals.filter(m => m.id !== id);
      mockDb.saveManuals(filtered);
    }
  }
};
