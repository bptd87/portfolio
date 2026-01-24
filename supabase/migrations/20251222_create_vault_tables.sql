-- Create Vault Tables

CREATE TABLE IF NOT EXISTS public.vault_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vault_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT REFERENCES public.vault_categories(slug) ON DELETE SET NULL, -- linking by slug for simplicity as per frontend, but ID is better. Frontend uses slug.
    asset_type TEXT DEFAULT '3d', -- 2d, 3d, hybrid
    
    -- Files
    vwx_file_url TEXT,
    preview_image_url TEXT,
    glb_file_url TEXT,
    thumbnail_url TEXT,
    
    -- Versioning
    vwx_version TEXT,
    backwards_compatible TEXT,
    
    -- Metadata
    tags TEXT[],
    reference_photos JSONB, -- Array of objects
    
    featured BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    downloads INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.vault_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_assets ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first for idempotency)
DROP POLICY IF EXISTS "Public read vault categories" ON public.vault_categories;
CREATE POLICY "Public read vault categories" ON public.vault_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read vault assets" ON public.vault_assets;
CREATE POLICY "Public read vault assets" ON public.vault_assets FOR SELECT USING (enabled = true);

-- Admin policies
DROP POLICY IF EXISTS "Admin all vault categories" ON public.vault_categories;
CREATE POLICY "Admin all vault categories" ON public.vault_categories USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admin all vault assets" ON public.vault_assets;
CREATE POLICY "Admin all vault assets" ON public.vault_assets USING (auth.role() = 'service_role' OR auth.role() = 'authenticated' OR auth.role() = 'anon');
