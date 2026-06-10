import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/types';
import { mockDb } from './mockData';

export const authService = {
  async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        // En caso de que el perfil no exista aún en la base de datos (por retraso del trigger)
        // creamos uno temporal
        return {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'Usuario',
          email: session.user.email || '',
          role: 'vendedor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return profile;
    } else {
      // En modo demo, si hay un usuario logueado en LocalStorage lo retornamos
      if (typeof window !== 'undefined') {
        const demoLogged = localStorage.getItem('okanpro_demo_logged');
        if (demoLogged === 'true') {
          return mockDb.getUser();
        }
      }
      return null;
    }
  },

  async login(email: string, password?: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      if (!password) throw new Error('Contraseña requerida');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No se pudo iniciar sesión');

      // Obtener perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      if (profile.activo === false) {
        throw new Error('Tu cuenta está pendiente de aprobación por un administrador. Comunícate con soporte@okanpro.com.');
      }
      return profile;
    } else {
      // Modo Demo
      if (typeof window !== 'undefined') {
        localStorage.setItem('okanpro_demo_logged', 'true');
      }
      const user = mockDb.getUser();
      // Actualizar el correo si es diferente
      if (email && email.includes('@')) {
        user.email = email;
        user.full_name = email.split('@')[0].toUpperCase();
        mockDb.saveUser(user);
      }
      return user;
    }
  },

  async signup(email: string, password?: string, fullName?: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      if (!password) throw new Error('Contraseña requerida');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'Nuevo Usuario',
          }
        }
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('No se pudo registrar el usuario');

      // En supabase real, el trigger creará el perfil. 
      // Esperamos un momento para asegurar que el trigger se ejecute y luego cargamos el perfil
      await new Promise(resolve => setTimeout(resolve, 800));
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return profile || {
        id: data.user.id,
        full_name: fullName || 'Nuevo Usuario',
        email: email,
        role: 'vendedor',
        activo: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Modo Demo
      if (typeof window !== 'undefined') {
        localStorage.setItem('okanpro_demo_logged', 'true');
      }
      const user = mockDb.getUser();
      user.email = email;
      user.full_name = fullName || 'Usuario Demo';
      user.role = 'administrador';
      user.activo = true;
      mockDb.saveUser(user);
      return user;
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('okanpro_demo_logged');
      }
    }
  },

  async getAllProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      return mockDb.getUsers();
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const users = mockDb.getUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      const updated = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      users[index] = updated;
      mockDb.saveUsers(users);
      return updated;
    }
  }
};
