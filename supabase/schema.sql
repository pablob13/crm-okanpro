-- SCHEMA FOR OKANPRO CRM
-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'vendedor' CHECK (role IN ('administrador', 'vendedor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. LEADS TABLE (Prospectos)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'calificado', 'perdido', 'convertido')),
    source TEXT DEFAULT 'directo',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. OPPORTUNITIES TABLE (Pipeline de Ventas)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    value DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido')),
    close_date DATE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 4. TASKS TABLE (Tareas / Actividades)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'llamada' CHECK (type IN ('llamada', 'reunion', 'correo', 'tarea')),
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completada')),
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
    due_date TIMESTAMP WITH TIME ZONE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. INTERACTIONS TABLE (Historial / Notas)
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'nota' CHECK (type IN ('nota', 'llamada', 'correo', 'reunion')),
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Profiles: Los usuarios autenticados pueden leer todos los perfiles, pero solo modificar el suyo.
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir actualización de perfil propio" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Leads: Los usuarios autenticados pueden ver todos los leads. Pueden insertar o actualizar si están autenticados.
CREATE POLICY "Permitir selección de leads a autenticados" 
ON public.leads FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción de leads a autenticados" 
ON public.leads FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de leads a autenticados" 
ON public.leads FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Permitir eliminación de leads a administradores" 
ON public.leads FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'administrador'
    )
);

-- Opportunities
CREATE POLICY "Permitir selección de oportunidades a autenticados" 
ON public.opportunities FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción de oportunidades a autenticados" 
ON public.opportunities FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de oportunidades a autenticados" 
ON public.opportunities FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Permitir eliminación de oportunidades a administradores" 
ON public.opportunities FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'administrador'
    )
);

-- Tasks
CREATE POLICY "Permitir selección de tareas a autenticados" 
ON public.tasks FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción de tareas a autenticados" 
ON public.tasks FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de tareas a autenticados" 
ON public.tasks FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Permitir eliminación de tareas a autenticados" 
ON public.tasks FOR DELETE 
TO authenticated 
USING (true);

-- Interactions
CREATE POLICY "Permitir selección de interacciones a autenticados" 
ON public.interactions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción de interacciones a autenticados" 
ON public.interactions FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ==========================================
-- TRIGGERS PARA AUTOCREACIÓN DE PERFILES
-- ==========================================

-- Crear un perfil automáticamente cuando se registre un nuevo usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario Nuevo'),
        new.email,
        'vendedor' -- Rol por defecto
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 6. MANUALS TABLE (Documentos / Manuales)
-- Para actualizar una base de datos existente, ejecuta:
-- ALTER TABLE public.manuals ADD COLUMN IF NOT EXISTS content TEXT;
-- ALTER TABLE public.manuals ADD COLUMN IF NOT EXISTS gdrive_url TEXT;
CREATE TABLE IF NOT EXISTS public.manuals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    file_url TEXT NOT NULL,
    file_size TEXT,
    content TEXT,
    gdrive_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.manuals ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Permitir selección de manuales a autenticados" 
ON public.manuals FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción de manuales a autenticados" 
ON public.manuals FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de manuales a autenticados" 
ON public.manuals FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Permitir eliminación de manuales a autenticados" 
ON public.manuals FOR DELETE 
TO authenticated 
USING (true);

