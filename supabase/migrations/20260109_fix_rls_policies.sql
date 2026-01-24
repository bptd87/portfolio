-- Ensure RLS is enabled
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Admins can insert projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.portfolio_projects;

-- Re-create Policies
-- 1. Public Read Access
CREATE POLICY "Public can view published projects" 
ON public.portfolio_projects FOR SELECT 
USING (true); -- Allow public to view ALL projects for now to debug, or flip back to (published = true)

-- 2. Admin Write Access (Authenticated Users)
CREATE POLICY "Admins can insert projects" 
ON public.portfolio_projects FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update projects" 
ON public.portfolio_projects FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete projects" 
ON public.portfolio_projects FOR DELETE 
USING (auth.role() = 'authenticated');

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'portfolio_projects';
