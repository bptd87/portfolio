-- Emergency Restore: Public Read Access for All Content Tables
-- Explicitly re-create "Public read" policies for all tables accessed by the frontend.

-- 1. Portfolio Projects
DROP POLICY IF EXISTS "Public read projects" ON public.portfolio_projects;
CREATE POLICY "Public read projects" ON public.portfolio_projects FOR SELECT USING (true);

-- 2. News
DROP POLICY IF EXISTS "Public read news" ON public.news;
CREATE POLICY "Public read news" ON public.news FOR SELECT USING (true);

-- 3. Articles
DROP POLICY IF EXISTS "Public read access" ON public.articles;
DROP POLICY IF EXISTS "Public read articles" ON public.articles;
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (true);

-- 4. Tutorials
DROP POLICY IF EXISTS "Public read tutorials" ON public.tutorials;
CREATE POLICY "Public read tutorials" ON public.tutorials FOR SELECT USING (true);

-- 5. Collaborators
DROP POLICY IF EXISTS "Public read collaborators" ON public.collaborators;
CREATE POLICY "Public read collaborators" ON public.collaborators FOR SELECT USING (true);

-- 6. Categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- 7. Site Configuration (Hero title, etc)
DROP POLICY IF EXISTS "Public read configuration" ON public.site_configuration;
CREATE POLICY "Public read configuration" ON public.site_configuration FOR SELECT USING (true);

-- 8. Media Library
DROP POLICY IF EXISTS "Public read media_library" ON public.media_library;
CREATE POLICY "Public read media_library" ON public.media_library FOR SELECT USING (true);

-- 9. Directory (if used publicly)
DROP POLICY IF EXISTS "Public read directory_categories" ON public.directory_categories;
CREATE POLICY "Public read directory_categories" ON public.directory_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read directory_links" ON public.directory_links;
CREATE POLICY "Public read directory_links" ON public.directory_links FOR SELECT USING (true);

-- 10. Bio Links
DROP POLICY IF EXISTS "Public read bio_links" ON public.bio_links;
CREATE POLICY "Public read bio_links" ON public.bio_links FOR SELECT USING (true);

-- 11. Page Views (Analytics)
DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
CREATE POLICY "Public insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
