-- SCHEMA FOR OKANPRO CRM
-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'vendedor' CHECK (role IN ('administrador', 'vendedor')),
    activo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Si la tabla profiles ya existía, ejecutamos esto para asegurar que la columna activo esté presente:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT false;

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
DROP POLICY IF EXISTS "Permitir lectura de perfiles a usuarios autenticados" ON public.profiles;
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir actualización de perfil propio" ON public.profiles;
CREATE POLICY "Permitir actualización de perfil propio" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir a administradores actualizar cualquier perfil" ON public.profiles;
CREATE POLICY "Permitir a administradores actualizar cualquier perfil" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'administrador'
    )
);

-- Leads: Los usuarios autenticados pueden ver todos los leads. Pueden insertar o actualizar si están autenticados.
DROP POLICY IF EXISTS "Permitir selección de leads a autenticados" ON public.leads;
CREATE POLICY "Permitir selección de leads a autenticados" 
ON public.leads FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de leads a autenticados" ON public.leads;
CREATE POLICY "Permitir inserción de leads a autenticados" 
ON public.leads FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de leads a autenticados" ON public.leads;
CREATE POLICY "Permitir actualización de leads a autenticados" 
ON public.leads FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de leads a administradores" ON public.leads;
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
DROP POLICY IF EXISTS "Permitir selección de oportunidades a autenticados" ON public.opportunities;
CREATE POLICY "Permitir selección de oportunidades a autenticados" 
ON public.opportunities FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de oportunidades a autenticados" ON public.opportunities;
CREATE POLICY "Permitir inserción de oportunidades a autenticados" 
ON public.opportunities FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de oportunidades a autenticados" ON public.opportunities;
CREATE POLICY "Permitir actualización de oportunidades a autenticados" 
ON public.opportunities FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de oportunidades a administradores" ON public.opportunities;
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
DROP POLICY IF EXISTS "Permitir selección de tareas a autenticados" ON public.tasks;
CREATE POLICY "Permitir selección de tareas a autenticados" 
ON public.tasks FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de tareas a autenticados" ON public.tasks;
CREATE POLICY "Permitir inserción de tareas a autenticados" 
ON public.tasks FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de tareas a autenticados" ON public.tasks;
CREATE POLICY "Permitir actualización de tareas a autenticados" 
ON public.tasks FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de tareas a autenticados" ON public.tasks;
CREATE POLICY "Permitir eliminación de tareas a autenticados" 
ON public.tasks FOR DELETE 
TO authenticated 
USING (true);

-- Interactions
DROP POLICY IF EXISTS "Permitir selección de interacciones a autenticados" ON public.interactions;
CREATE POLICY "Permitir selección de interacciones a autenticados" 
ON public.interactions FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de interacciones a autenticados" ON public.interactions;
CREATE POLICY "Permitir inserción de interacciones a autenticados" 
ON public.interactions FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ==========================================
-- TRIGGERS PARA AUTOCREACIÓN DE PERFILES
-- ==========================================

-- Crear un perfil automáticamente cuando se registre un nuevo usuario en Supabase Auth
-- Si es el primer usuario en registrarse, se activa automáticamente y se le asigna rol administrador.
-- De lo contrario, se crea inactivo (pendiente de aprobación) y con rol vendedor.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

    INSERT INTO public.profiles (id, full_name, email, role, activo)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario Nuevo'),
        new.email,
        CASE WHEN is_first_user THEN 'administrador' ELSE 'vendedor' END,
        is_first_user
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
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
DROP POLICY IF EXISTS "Permitir selección de manuales a autenticados" ON public.manuals;
CREATE POLICY "Permitir selección de manuales a autenticados" 
ON public.manuals FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de manuales a autenticados" ON public.manuals;
CREATE POLICY "Permitir inserción de manuales a autenticados" 
ON public.manuals FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de manuales a autenticados" ON public.manuals;
CREATE POLICY "Permitir actualización de manuales a autenticados" 
ON public.manuals FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de manuales a autenticados" ON public.manuals;
CREATE POLICY "Permitir eliminación de manuales a autenticados" 
ON public.manuals FOR DELETE 
TO authenticated 
USING (true);

-- 7. EXPENSES TABLE (Gastos)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'conciliado')),
    payment_method TEXT NOT NULL,
    receipt_url TEXT,
    reconciliation_date TIMESTAMP WITH TIME ZONE,
    reconciled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para expenses
DROP POLICY IF EXISTS "Permitir lectura de gastos a autenticados" ON public.expenses;
CREATE POLICY "Permitir lectura de gastos a autenticados" 
ON public.expenses FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de gastos a autenticados" ON public.expenses;
CREATE POLICY "Permitir inserción de gastos a autenticados" 
ON public.expenses FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de gastos a autenticados" ON public.expenses;
CREATE POLICY "Permitir actualización de gastos a autenticados" 
ON public.expenses FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de gastos a autenticados" ON public.expenses;
CREATE POLICY "Permitir eliminación de gastos a autenticados" 
ON public.expenses FOR DELETE 
TO authenticated 
USING (true);

-- 8. BANK MOVEMENTS TABLE (Movimientos Bancarios)
CREATE TABLE IF NOT EXISTS public.bank_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reconciled BOOLEAN DEFAULT false NOT NULL,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.bank_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para bank_movements
DROP POLICY IF EXISTS "Permitir lectura de movimientos a autenticados" ON public.bank_movements;
CREATE POLICY "Permitir lectura de movimientos a autenticados" 
ON public.bank_movements FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de movimientos a autenticados" ON public.bank_movements;
CREATE POLICY "Permitir inserción de movimientos a autenticados" 
ON public.bank_movements FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de movimientos a autenticados" ON public.bank_movements;
CREATE POLICY "Permitir actualización de movimientos a autenticados" 
ON public.bank_movements FOR UPDATE 
TO authenticated 
USING (true);

-- 9. PRODUCTS TABLE (Productos)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    price DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para products
DROP POLICY IF EXISTS "Permitir lectura de productos a autenticados" ON public.products;
CREATE POLICY "Permitir lectura de productos a autenticados" 
ON public.products FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de productos a autenticados" ON public.products;
CREATE POLICY "Permitir inserción de productos a autenticados" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de productos a autenticados" ON public.products;
CREATE POLICY "Permitir actualización de productos a autenticados" 
ON public.products FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de productos a autenticados" ON public.products;
CREATE POLICY "Permitir eliminación de productos a autenticados" 
ON public.products FOR DELETE 
TO authenticated 
USING (true);

-- Agregar columna de imagen de forma idempotente para bases de datos ya creadas
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 10. STORAGE BUCKET FOR PRODUCT IMAGES (Bucket de imágenes de productos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para storage.objects asociadas al bucket product-images
DROP POLICY IF EXISTS "Acceso publico a imagenes de productos" ON storage.objects;
CREATE POLICY "Acceso publico a imagenes de productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Permitir subida de imagenes a autenticados" ON storage.objects;
CREATE POLICY "Permitir subida de imagenes a autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Permitir actualizacion de imagenes a autenticados" ON storage.objects;
CREATE POLICY "Permitir actualizacion de imagenes a autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Permitir borrado de imagenes a autenticados" ON storage.objects;
CREATE POLICY "Permitir borrado de imagenes a autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- 11. QUOTES & QUOTE ITEMS TABLES (Cotizaciones y Conceptos)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    project_type TEXT DEFAULT 'sonido' NOT NULL,
    status TEXT DEFAULT 'borrador'::text NOT NULL,
    subtotal DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    tax DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Agregar columna project_type de forma idempotente y limpiar restricciones antiguas
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'sonido';
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_project_type_check;

CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para quotes
DROP POLICY IF EXISTS "Permitir lectura de cotizaciones a autenticados" ON public.quotes;
CREATE POLICY "Permitir lectura de cotizaciones a autenticados" 
ON public.quotes FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de cotizaciones a autenticados" ON public.quotes;
CREATE POLICY "Permitir inserción de cotizaciones a autenticados" 
ON public.quotes FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de cotizaciones a autenticados" ON public.quotes;
CREATE POLICY "Permitir actualización de cotizaciones a autenticados" 
ON public.quotes FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de cotizaciones a autenticados" ON public.quotes;
CREATE POLICY "Permitir eliminación de cotizaciones a autenticados" 
ON public.quotes FOR DELETE 
TO authenticated 
USING (true);

-- Políticas de RLS para quote_items
DROP POLICY IF EXISTS "Permitir lectura de conceptos a autenticados" ON public.quote_items;
CREATE POLICY "Permitir lectura de conceptos a autenticados" 
ON public.quote_items FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserción de conceptos a autenticados" ON public.quote_items;
CREATE POLICY "Permitir inserción de conceptos a autenticados" 
ON public.quote_items FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de conceptos a autenticados" ON public.quote_items;
CREATE POLICY "Permitir actualización de conceptos a autenticados" 
ON public.quote_items FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de conceptos a autenticados" ON public.quote_items;
CREATE POLICY "Permitir eliminación de conceptos a autenticados" 
ON public.quote_items FOR DELETE 
TO authenticated 
USING (true);

