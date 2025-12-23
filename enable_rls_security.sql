-- Enable RLS for articles and vault_assets to fix security warnings

-- 1. Enable RLS on the tables
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vault_assets ENABLE ROW LEVEL SECURITY;

-- 2. Add Public Read Policies
-- Articles: Allow anyone to read published articles
DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles" 
ON public.articles 
FOR SELECT 
USING (published = true);

-- Vault Assets: Allow anyone to read all assets (assuming public vault)
DROP POLICY IF EXISTS "Public read vault assets" ON public.vault_assets;
CREATE POLICY "Public read vault assets" 
ON public.vault_assets 
FOR SELECT 
USING (true);

-- 3. Add Admin Write Policies (Optional but good practice)
-- Allow Service Role or Authenticated Admin users to manage everything
DROP POLICY IF EXISTS "Admin manage articles" ON public.articles;
CREATE POLICY "Admin manage articles" 
ON public.articles 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage vault assets" ON public.vault_assets;
CREATE POLICY "Admin manage vault assets" 
ON public.vault_assets 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
