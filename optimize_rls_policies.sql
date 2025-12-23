-- Optimize RLS Policies to fix 'auth_rls_initplan' and 'multiple_permissive_policies' warnings
-- 1. Wraps auth.role() checks in (select ...) for performance caching.
-- 2. Restricts "Public" policies to 'anon' role to avoid overlap with 'authenticated' Admin policies.

-- ==========================================
-- 1. NEWS
-- ==========================================
DROP POLICY IF EXISTS "Admin all news" ON public.news;
CREATE POLICY "Admin all news" ON public.news
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read news" ON public.news;
CREATE POLICY "Public read news" ON public.news
FOR SELECT
TO anon
USING (published = true);


-- ==========================================
-- 2. ARTICLES
-- ==========================================
DROP POLICY IF EXISTS "Admin manage articles" ON public.articles;
CREATE POLICY "Admin manage articles" ON public.articles
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles" ON public.articles
FOR SELECT
TO anon
USING (published = true);


-- ==========================================
-- 3. COLLABORATORS
-- ==========================================
DROP POLICY IF EXISTS "Admin all collaborators" ON public.collaborators;
CREATE POLICY "Admin all collaborators" ON public.collaborators
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read collaborators" ON public.collaborators;
CREATE POLICY "Public read collaborators" ON public.collaborators
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 4. BIO LINKS
-- ==========================================
DROP POLICY IF EXISTS "Admin all bio_links" ON public.bio_links;
CREATE POLICY "Admin all bio_links" ON public.bio_links
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read bio_links" ON public.bio_links;
CREATE POLICY "Public read bio_links" ON public.bio_links
FOR SELECT
TO anon
USING (enabled = true);


-- ==========================================
-- 5. SITE CONFIGURATION
-- ==========================================
DROP POLICY IF EXISTS "Admin all configuration" ON public.site_configuration;
CREATE POLICY "Admin all configuration" ON public.site_configuration
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read configuration" ON public.site_configuration;
CREATE POLICY "Public read configuration" ON public.site_configuration
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 6. CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "Admin all categories" ON public.categories;
CREATE POLICY "Admin all categories" ON public.categories
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 7. VAULT ASSETS
-- ==========================================
DROP POLICY IF EXISTS "Admin manage vault assets" ON public.vault_assets;
CREATE POLICY "Admin manage vault assets" ON public.vault_assets
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read vault assets" ON public.vault_assets;
CREATE POLICY "Public read vault assets" ON public.vault_assets
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 8. VAULT CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "Admin all vault categories" ON public.vault_categories;
CREATE POLICY "Admin all vault categories" ON public.vault_categories
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read vault categories" ON public.vault_categories;
CREATE POLICY "Public read vault categories" ON public.vault_categories
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 9. DIRECTORY CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "Admin all directory categories" ON public.directory_categories;
CREATE POLICY "Admin all directory categories" ON public.directory_categories
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read directory categories" ON public.directory_categories;
CREATE POLICY "Public read directory categories" ON public.directory_categories
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 10. DIRECTORY LINKS
-- ==========================================
DROP POLICY IF EXISTS "Admin all directory links" ON public.directory_links;
CREATE POLICY "Admin all directory links" ON public.directory_links
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Public read directory links" ON public.directory_links;
CREATE POLICY "Public read directory links" ON public.directory_links
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 11. ABOUT GALLERY
-- ==========================================
DROP POLICY IF EXISTS "Allow authenticated users to manage about_gallery" ON public.about_gallery;
CREATE POLICY "Admin manage about_gallery" ON public.about_gallery
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow public read access to about_gallery" ON public.about_gallery;
CREATE POLICY "Public read about_gallery" ON public.about_gallery
FOR SELECT
TO anon
USING (true);


-- ==========================================
-- 12. PAGE VIEWS
-- ==========================================
-- Adjust Insert for Anon
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.page_views;
DROP POLICY IF EXISTS "Allow public inserts" ON public.page_views; 
CREATE POLICY "Anon insert page_views" ON public.page_views
FOR INSERT
TO anon
WITH CHECK (true);

-- Admin View
DROP POLICY IF EXISTS "Allow admins to view analytics" ON public.page_views;
CREATE POLICY "Admin view page_views" ON public.page_views
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');


-- ==========================================
-- 13. MEDIA LIBRARY (Cleanup duplicates)
-- ==========================================
DROP POLICY IF EXISTS "Admin can manage media metadata" ON public.media_library;
DROP POLICY IF EXISTS "Enable read media" ON public.media_library;
DROP POLICY IF EXISTS "Public can read media metadata" ON public.media_library;
DROP POLICY IF EXISTS "Enable insert media" ON public.media_library;
DROP POLICY IF EXISTS "Enable update media" ON public.media_library;
DROP POLICY IF EXISTS "Enable delete media" ON public.media_library;

-- Recreate Clean Policies
CREATE POLICY "Admin manage media_library" ON public.media_library
FOR ALL
TO authenticated, service_role
USING ((select auth.role()) = 'authenticated' OR (select auth.role()) = 'service_role');

CREATE POLICY "Public read media_library" ON public.media_library
FOR SELECT
TO anon
USING (true);
