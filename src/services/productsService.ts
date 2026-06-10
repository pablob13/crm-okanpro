import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/types';
import { mockDb } from './mockData';

export const productsService = {
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getProducts();
    }
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const products = mockDb.getProducts();
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDb.saveProducts([...products, newProduct]);
      return newProduct;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const products = mockDb.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Producto no encontrado');
      
      const updatedProduct = {
        ...products[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      products[index] = updatedProduct;
      mockDb.saveProducts(products);
      return updatedProduct;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const products = mockDb.getProducts();
      const filtered = products.filter(p => p.id !== id);
      mockDb.saveProducts(filtered);
    }
  }
};
