import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Quote, QuoteItem } from '@/types';
import { mockDb } from './mockData';

export const quotesService = {
  async getQuotes(): Promise<Quote[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, lead:leads(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      const quotes = mockDb.getQuotes();
      const leads = mockDb.getLeads();
      return quotes.map(q => ({
        ...q,
        lead: leads.find(l => l.id === q.client_id)
      })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async getQuoteById(id: string): Promise<(Quote & { items: QuoteItem[] }) | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, lead:leads(*)')
        .eq('id', id)
        .single();
      
      if (quoteError) {
        if (quoteError.code === 'PGRST116') return null; // No rows found
        throw quoteError;
      }
      if (!quote) return null;

      const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', id);
      
      if (itemsError) throw itemsError;

      return {
        ...quote,
        items: items || []
      };
    } else {
      const quotes = mockDb.getQuotes();
      const quote = quotes.find(q => q.id === id);
      if (!quote) return null;

      const leads = mockDb.getLeads();
      const lead = leads.find(l => l.id === quote.client_id);

      const items = mockDb.getQuoteItems();
      const quoteItems = items.filter(item => item.quote_id === id);

      return {
        ...quote,
        lead,
        items: quoteItems
      };
    }
  },

  async createQuote(
    quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ): Promise<Quote & { items: QuoteItem[] }> {
    if (isSupabaseConfigured && supabase) {
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([quote])
        .select()
        .single();
      
      if (quoteError) throw quoteError;

      const quoteId = quoteData.id;
      const itemsToInsert = items.map(item => ({
        ...item,
        quote_id: quoteId
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;

      // Fetch inserted items to return with their generated ids
      const { data: insertedItems, error: fetchItemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId);

      if (fetchItemsError) throw fetchItemsError;

      return {
        ...quoteData,
        items: insertedItems || []
      };
    } else {
      const quotes = mockDb.getQuotes();
      const newQuote: Quote = {
        ...quote,
        id: `quote-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveQuotes([newQuote, ...quotes]);

      const allItems = mockDb.getQuoteItems();
      const newItems: QuoteItem[] = items.map((item, idx) => ({
        ...item,
        id: `qitem-${Date.now()}-${idx}`,
        quote_id: newQuote.id,
      }));
      mockDb.saveQuoteItems([...allItems, ...newItems]);

      return {
        ...newQuote,
        items: newItems
      };
    }
  },

  async updateQuote(
    id: string,
    updates: Partial<Quote>,
    items?: Omit<QuoteItem, 'id' | 'quote_id'>[]
  ): Promise<Quote & { items: QuoteItem[] }> {
    if (isSupabaseConfigured && supabase) {
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (quoteError) throw quoteError;

      if (items) {
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id);
        
        if (deleteError) throw deleteError;

        const itemsToInsert = items.map(item => ({
          ...item,
          quote_id: id
        }));

        const { error: insertError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert);
        
        if (insertError) throw insertError;
      }

      const { data: currentItems, error: fetchItemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', id);

      if (fetchItemsError) throw fetchItemsError;

      return {
        ...quoteData,
        items: currentItems || []
      };
    } else {
      const quotes = mockDb.getQuotes();
      const index = quotes.findIndex(q => q.id === id);
      if (index === -1) throw new Error('Cotización no encontrada');

      const updatedQuote = {
        ...quotes[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      quotes[index] = updatedQuote;
      mockDb.saveQuotes(quotes);

      if (items) {
        const allItems = mockDb.getQuoteItems();
        const filteredItems = allItems.filter(item => item.quote_id !== id);
        const newItems: QuoteItem[] = items.map((item, idx) => ({
          ...item,
          id: `qitem-${Date.now()}-${idx}`,
          quote_id: id,
        }));
        mockDb.saveQuoteItems([...filteredItems, ...newItems]);
        
        return {
          ...updatedQuote,
          items: newItems
        };
      } else {
        const allItems = mockDb.getQuoteItems();
        const quoteItems = allItems.filter(item => item.quote_id === id);
        return {
          ...updatedQuote,
          items: quoteItems
        };
      }
    }
  },

  async deleteQuote(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const quotes = mockDb.getQuotes();
      mockDb.saveQuotes(quotes.filter(q => q.id !== id));

      const items = mockDb.getQuoteItems();
      mockDb.saveQuoteItems(items.filter(item => item.quote_id !== id));
    }
  }
};
