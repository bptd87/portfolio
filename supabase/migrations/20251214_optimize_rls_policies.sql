-- Optimize RLS policies for portfolio_projects to avoid re-evaluating auth.role() for every row
-- Remediation for: auth_rls_initplan

DROP POLICY IF EXISTS "Public can view published projects" ON public.portfolio_projects;
CREATE POLICY "Public can view published projects" 
ON public.portfolio_projects FOR SELECT 
USING (published = true OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Admins can insert projects" ON public.portfolio_projects;
CREATE POLICY "Admins can insert projects" 
ON public.portfolio_projects FOR INSERT 
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Admins can update projects" ON public.portfolio_projects;
CREATE POLICY "Admins can update projects" 
ON public.portfolio_projects FOR UPDATE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete projects" ON public.portfolio_projects;
CREATE POLICY "Admins can delete projects" 
ON public.portfolio_projects FOR DELETE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');
