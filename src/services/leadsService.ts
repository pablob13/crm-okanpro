import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead, Interaction, InteractionType, LeadStatus } from '@/types';
import { mockDb } from './mockData';

export const leadsService = {
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*, assigned_profile:profiles(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getLeads();
    }
  },

  async getLeadById(id: string): Promise<Lead | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*, assigned_profile:profiles(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const leads = mockDb.getLeads();
      return leads.find(l => l.id === id) || null;
    }
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const leads = mockDb.getLeads();
      const newLead: Lead = {
        ...lead,
        id: `lead-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveLeads([newLead, ...leads]);
      return newLead;
    }
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const leads = mockDb.getLeads();
      const index = leads.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lead no encontrado');
      
      const updatedLead = {
        ...leads[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      leads[index] = updatedLead;
      mockDb.saveLeads(leads);
      return updatedLead;
    }
  },

  async deleteLead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const leads = mockDb.getLeads();
      const filtered = leads.filter(l => l.id !== id);
      mockDb.saveLeads(filtered);

      // Eliminar dependencias locales
      const opps = mockDb.getOpportunities();
      mockDb.saveOpportunities(opps.filter(o => o.lead_id !== id));

      const tasks = mockDb.getTasks();
      mockDb.saveTasks(tasks.filter(t => t.lead_id !== id));

      const ints = mockDb.getInteractions();
      mockDb.saveInteractions(ints.filter(i => i.lead_id !== id));
    }
  },

  async getInteractions(leadId: string): Promise<Interaction[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('interactions')
        .select('*, creator_profile:profiles(*)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const ints = mockDb.getInteractions();
      return ints
        .filter(i => i.lead_id === leadId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async addInteraction(leadId: string, notes: string, type: InteractionType = 'nota'): Promise<Interaction> {
    const creatorId = isSupabaseConfigured ? null : mockDb.getUser().id;
    
    if (isSupabaseConfigured && supabase) {
      // Obtener el ID del usuario autenticado actual
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('interactions')
        .insert([{
          lead_id: leadId,
          notes,
          type,
          created_by: user?.id || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const ints = mockDb.getInteractions();
      const newInt: Interaction = {
        id: `int-${Date.now()}`,
        lead_id: leadId,
        notes,
        type,
        created_by: creatorId,
        created_at: new Date().toISOString(),
      };
      
      mockDb.saveInteractions([newInt, ...ints]);
      return newInt;
    }
  }
};
