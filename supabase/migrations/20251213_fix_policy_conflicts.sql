-- Migration to fix "Multiple Permissive Policies" warnings
-- The warning occurs because we have "FOR SELECT" policies AND "FOR ALL" policies (which include SELECT).
-- Solution: Split the "FOR ALL" write policies into explicit "INSERT", "UPDATE", "DELETE" policies.

-- Macro-style approach for each table

-- 1. COMPANIES
DROP POLICY IF EXISTS "Allow public read access" ON public.companies;
DROP POLICY IF EXISTS "Allow admin full access" ON public.companies;

CREATE POLICY "Enable read access for all" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.companies FOR DELETE USING (true);

-- 2. CONTACTS
DROP POLICY IF EXISTS "Allow public read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow admin full access" ON public.contacts;

CREATE POLICY "Enable read access for all" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.contacts FOR DELETE USING (true);

-- 3. INTERACTIONS
DROP POLICY IF EXISTS "Allow public read access" ON public.interactions;
DROP POLICY IF EXISTS "Allow admin full access" ON public.interactions;

CREATE POLICY "Enable read access for all" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.interactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.interactions FOR DELETE USING (true);

-- 4. INVOICES
DROP POLICY IF EXISTS "Allow public read access" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin full access" ON public.invoices;

CREATE POLICY "Enable read access for all" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.invoices FOR DELETE USING (true);

-- 5. INVOICE ITEMS
DROP POLICY IF EXISTS "Allow public read access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow admin full access" ON public.invoice_items;

CREATE POLICY "Enable read access for all" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.invoice_items FOR DELETE USING (true);

-- 6. TIME ENTRIES
DROP POLICY IF EXISTS "Allow public read access" ON public.time_entries;
DROP POLICY IF EXISTS "Allow admin full access" ON public.time_entries;

CREATE POLICY "Enable read access for all" ON public.time_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.time_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.time_entries FOR DELETE USING (true);

-- 7. KV STORE (980dd7a4)
DROP POLICY IF EXISTS "Allow public read access" ON public.kv_store_980dd7a4;
DROP POLICY IF EXISTS "Allow admin write access" ON public.kv_store_980dd7a4;

CREATE POLICY "Enable read access for all" ON public.kv_store_980dd7a4 FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.kv_store_980dd7a4 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.kv_store_980dd7a4 FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.kv_store_980dd7a4 FOR DELETE USING (true);

-- 8. MEDIA LIBRARY
DROP POLICY IF EXISTS "Allow all operations for now" ON public.media_library;
DROP POLICY IF EXISTS "Public can read media metadata" ON public.media_library;

CREATE POLICY "Enable read access for all" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.media_library FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.media_library FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.media_library FOR DELETE USING (true);
