-- Create tables for Scenic Directory
CREATE TABLE IF NOT EXISTS public.directory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.directory_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category_slug TEXT REFERENCES public.directory_categories(slug) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.directory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_links ENABLE ROW LEVEL SECURITY;

-- Add policies
-- Add policies (Drop first to ensure idempotency)
DROP POLICY IF EXISTS "Public read directory categories" ON public.directory_categories;
CREATE POLICY "Public read directory categories" ON public.directory_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read directory links" ON public.directory_links;
CREATE POLICY "Public read directory links" ON public.directory_links FOR SELECT USING (enabled = true);

-- Admin policies
DROP POLICY IF EXISTS "Admin all directory categories" ON public.directory_categories;
CREATE POLICY "Admin all directory categories" ON public.directory_categories USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon'); 
-- Note: Added anon temporarily if you are developing without full auth setup, otherwise revert to just service_role/authenticated

DROP POLICY IF EXISTS "Admin all directory links" ON public.directory_links;
CREATE POLICY "Admin all directory links" ON public.directory_links USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon');
