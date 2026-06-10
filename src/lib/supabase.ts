import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detectar si Supabase está correctamente configurado
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'tu-url-de-supabase' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'tu-key-anonima-de-supabase';

// Crear el cliente de Supabase (o nulo si no está configurado)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
