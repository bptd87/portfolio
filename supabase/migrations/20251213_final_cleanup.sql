-- MASTER CLEANUP SCRIPT (Fixes 42+ Warnings)
-- 1. Removes specific duplicate indexes (keeping only the intended ones)
-- 2. Refactors RLS policies to eliminate "Multiple Permissive Policies" warnings

-- =================================================================
-- PART 1: REMOVE DUPLICATE INDEXES
-- =================================================================
DO $$
DECLARE
  idx_name text;
BEGIN
  -- Cleanup duplicates on kv_store_980dd7a4
  -- We want to keep 'kv_store_key_idx' (our manual optimized index). 
  -- We drop any auto-generated ones like 'kv_store_980dd7a4_key_idx1', etc.
  FOR idx_name IN 
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'kv_store_980dd7a4' 
    AND indexname LIKE 'kv_store_980dd7a4_key_idx%' -- Targeted pattern for duplicates
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS public.' || quote_ident(idx_name);
  END LOOP;

  -- Cleanup duplicates on kv_store_74296234 (Legacy table)
  FOR idx_name IN 
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'kv_store_74296234' 
    AND indexname LIKE 'kv_store_74296234_key_idx%' 
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS public.' || quote_ident(idx_name);
  END LOOP;
  
  RAISE NOTICE 'Duplicate indexes cleaned up.';
END $$;

-- Ensure our correct index exists
CREATE INDEX IF NOT EXISTS kv_store_key_idx ON public.kv_store_980dd7a4 (key);


-- =================================================================
-- PART 2: FIX PERMISSIVE POLICIES (Split 'ALL' into specific actions)
-- =================================================================

-- 1. COMPANIES
DROP POLICY IF EXISTS "Allow public read access" ON public.companies;
DROP POLICY IF EXISTS "Allow admin full access" ON public.companies;
CREATE POLICY "Enable read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Enable insert companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update companies" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Enable delete companies" ON public.companies FOR DELETE USING (true);

-- 2. CONTACTS
DROP POLICY IF EXISTS "Allow public read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow admin full access" ON public.contacts;
CREATE POLICY "Enable read contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update contacts" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete contacts" ON public.contacts FOR DELETE USING (true);

-- 3. INTERACTIONS
DROP POLICY IF EXISTS "Allow public read access" ON public.interactions;
DROP POLICY IF EXISTS "Allow admin full access" ON public.interactions;
CREATE POLICY "Enable read interactions" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Enable insert interactions" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update interactions" ON public.interactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete interactions" ON public.interactions FOR DELETE USING (true);

-- 4. INVOICES
DROP POLICY IF EXISTS "Allow public read access" ON public.invoices;
DROP POLICY IF EXISTS "Allow admin full access" ON public.invoices;
CREATE POLICY "Enable read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete invoices" ON public.invoices FOR DELETE USING (true);

-- 5. INVOICE ITEMS
DROP POLICY IF EXISTS "Allow public read access" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow admin full access" ON public.invoice_items;
CREATE POLICY "Enable read inv_items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Enable insert inv_items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update inv_items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete inv_items" ON public.invoice_items FOR DELETE USING (true);

-- 6. TIME ENTRIES
DROP POLICY IF EXISTS "Allow public read access" ON public.time_entries;
DROP POLICY IF EXISTS "Allow admin full access" ON public.time_entries;
CREATE POLICY "Enable read time_entries" ON public.time_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert time_entries" ON public.time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update time_entries" ON public.time_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete time_entries" ON public.time_entries FOR DELETE USING (true);

-- 7. KV STORE (980dd7a4)
DROP POLICY IF EXISTS "Allow public read access" ON public.kv_store_980dd7a4;
DROP POLICY IF EXISTS "Allow admin write access" ON public.kv_store_980dd7a4;
CREATE POLICY "Enable read kv_store" ON public.kv_store_980dd7a4 FOR SELECT USING (true);
CREATE POLICY "Enable insert kv_store" ON public.kv_store_980dd7a4 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update kv_store" ON public.kv_store_980dd7a4 FOR UPDATE USING (true);
CREATE POLICY "Enable delete kv_store" ON public.kv_store_980dd7a4 FOR DELETE USING (true);

-- 8. MEDIA LIBRARY
DROP POLICY IF EXISTS "Allow all operations for now" ON public.media_library;
DROP POLICY IF EXISTS "Public can read media metadata" ON public.media_library;
CREATE POLICY "Enable read media" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Enable insert media" ON public.media_library FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update media" ON public.media_library FOR UPDATE USING (true);
CREATE POLICY "Enable delete media" ON public.media_library FOR DELETE USING (true);
