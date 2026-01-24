-- OPTIMIZATION & SECURITY FIX: Consolidate Policies
-- Addresses "Multiple Permissive Policies" warnings and secures open access

-- 1. app_settings
-- Current Issue: "Admin Manage Settings" (ALL) overlaps with "Public Read Settings" (SELECT)
-- Fix: Keep Public Read for SELECT. Restrict Admin policies to INSERT/UPDATE/DELETE only (split) so they don't overlap SELECT.
-- Security: Restrict Admin actions to service_role or authenticated users.

DROP POLICY IF EXISTS "Admin Manage Settings" ON public.app_settings;
DROP POLICY IF EXISTS "Public Read Settings" ON public.app_settings;
-- Drop potential legacy ones
DROP POLICY IF EXISTS "Allow public read access" ON public.app_settings;
DROP POLICY IF EXISTS "Allow admin full access" ON public.app_settings;

CREATE POLICY "Public Read Settings" ON public.app_settings FOR SELECT USING (true);

CREATE POLICY "Admin Insert Settings" ON public.app_settings FOR INSERT 
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

CREATE POLICY "Admin Update Settings" ON public.app_settings FOR UPDATE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

CREATE POLICY "Admin Delete Settings" ON public.app_settings FOR DELETE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');


-- 2. expense_categories
-- Similar fix as app_settings

DROP POLICY IF EXISTS "Admin Manage Categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Public Read Categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow public read access categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow admin modify categories" ON public.expense_categories;

CREATE POLICY "Public Read Categories" ON public.expense_categories FOR SELECT USING (true);

CREATE POLICY "Admin Insert Categories" ON public.expense_categories FOR INSERT 
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

CREATE POLICY "Admin Update Categories" ON public.expense_categories FOR UPDATE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');

CREATE POLICY "Admin Delete Categories" ON public.expense_categories FOR DELETE 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');


-- 3. companies
-- Current Issue: Multiple policies allowing anon access (unsafe for CRM)
-- Fix: Consolidate to single Admin Full Access policy. Remove Anon access.

DROP POLICY IF EXISTS "Allow admin full access companies" ON public.companies;
DROP POLICY IF EXISTS "Enable delete companies" ON public.companies;
DROP POLICY IF EXISTS "Enable insert companies" ON public.companies;
DROP POLICY IF EXISTS "Enable read companies" ON public.companies;
DROP POLICY IF EXISTS "Enable update companies" ON public.companies;

CREATE POLICY "Admin Manage Companies" ON public.companies FOR ALL 
USING ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated')
WITH CHECK ((select auth.role()) = 'service_role' OR (select auth.role()) = 'authenticated');
