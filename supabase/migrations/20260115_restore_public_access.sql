-- Restore Public Access to Dynamic Content
-- This migration ensures that projects, news, and tutorials are publicly readable.

-- Portfolio Projects
DROP POLICY IF EXISTS "Public read projects" ON public.portfolio_projects;
CREATE POLICY "Public read projects"
ON public.portfolio_projects FOR SELECT
USING (true); 

-- News
DROP POLICY IF EXISTS "Public read news" ON public.news;
CREATE POLICY "Public read news"
ON public.news FOR SELECT
USING (true);

-- Tutorials
DROP POLICY IF EXISTS "Public read tutorials" ON public.tutorials;
CREATE POLICY "Public read tutorials"
ON public.tutorials FOR SELECT
USING (true);

-- Collaborators
DROP POLICY IF EXISTS "Public read collaborators" ON public.collaborators;
CREATE POLICY "Public read collaborators"
ON public.collaborators FOR SELECT
USING (true);
