-- Quick fix to ensure vault_categories table exists
-- Run this in Supabase Dashboard SQL Editor if you get 404 errors

CREATE TABLE IF NOT EXISTS public.vault_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vault_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read vault categories" ON public.vault_categories;
DROP POLICY IF EXISTS "Admin all vault categories" ON public.vault_categories;

-- Create policies
CREATE POLICY "Public read vault categories" ON public.vault_categories 
    FOR SELECT USING (true);

CREATE POLICY "Admin all vault categories" ON public.vault_categories 
    FOR ALL USING (auth.role() = 'authenticated');
