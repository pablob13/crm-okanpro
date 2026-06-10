import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Opportunity, OpportunityStage } from '@/types';
import { mockDb } from './mockData';

export const opportunitiesService = {
  async getOpportunities(): Promise<Opportunity[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, lead:leads(*), assigned_profile:profiles(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const opps = mockDb.getOpportunities();
      const leads = mockDb.getLeads();
      return opps.map(opp => ({
        ...opp,
        lead: leads.find(l => l.id === opp.lead_id) || undefined,
      }));
    }
  },

  async createOpportunity(opp: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunity> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([opp])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const opps = mockDb.getOpportunities();
      const newOpp: Opportunity = {
        ...opp,
        id: `opp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveOpportunities([newOpp, ...opps]);
      
      // Auto-actualizar el lead correspondiente a 'convertido' si ganamos la oportunidad
      if (opp.stage === 'ganado') {
        const leads = mockDb.getLeads();
        const index = leads.findIndex(l => l.id === opp.lead_id);
        if (index !== -1) {
          leads[index].status = 'convertido';
          mockDb.saveLeads(leads);
        }
      }
      
      return newOpp;
    }
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const opps = mockDb.getOpportunities();
      const index = opps.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Oportunidad no encontrada');
      
      const updatedOpp = {
        ...opps[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      opps[index] = updatedOpp;
      mockDb.saveOpportunities(opps);
      
      // Si cambia a ganado, actualizar el status del lead
      if (updates.stage === 'ganado') {
        const leads = mockDb.getLeads();
        const leadIndex = leads.findIndex(l => l.id === updatedOpp.lead_id);
        if (leadIndex !== -1) {
          leads[leadIndex].status = 'convertido';
          mockDb.saveLeads(leads);
        }
      }
      
      return updatedOpp;
    }
  },

  async updateOpportunityStage(id: string, stage: OpportunityStage): Promise<Opportunity> {
    return this.updateOpportunity(id, { stage });
  },

  async deleteOpportunity(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const opps = mockDb.getOpportunities();
      const filtered = opps.filter(o => o.id !== id);
      mockDb.saveOpportunities(filtered);
    }
  }
};
