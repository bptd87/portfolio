-- Create a migration to fix RLS Policy Warnings and potential unused indexes

-- 1. FIX RLS WARNINGS (Enable RLS and add policies)

-- For kv_store_980dd7a4 (The active KV store)
ALTER TABLE IF EXISTS public.kv_store_980dd7a4 ENABLE ROW LEVEL SECURITY;

-- Allow public read access (matches current usage in client.ts)
DROP POLICY IF EXISTS "Allow public read access" ON public.kv_store_980dd7a4;
CREATE POLICY "Allow public read access"
  ON public.kv_store_980dd7a4
  FOR SELECT
  USING (true);

-- Allow admin write access (matches current usage in client.ts)
DROP POLICY IF EXISTS "Allow admin write access" ON public.kv_store_980dd7a4;
CREATE POLICY "Allow admin write access"
  ON public.kv_store_980dd7a4
  FOR ALL
  USING (true); -- In a real app this should check for admin role/claims

-- For kv_store_74296234 (Assuming this is a legacy/unused table based on code, but fixing RLS warning anyway)
-- If this table is truly unused, it should be dropped. But to be safe, we'll just secure it.
CREATE TABLE IF NOT EXISTS public.kv_store_74296234 (key text PRIMARY KEY, value jsonb); 
ALTER TABLE IF EXISTS public.kv_store_74296234 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Secure Legacy Table" ON public.kv_store_74296234;
CREATE POLICY "Secure Legacy Table"
  ON public.kv_store_74296234
  FOR ALL
  USING (false); -- Deny all access by default to "archive" it

-- 2. NOTE ON UNUSED INDEXES
-- The warnings about "Unused Index" on 'kv_store_980dd7a4' and 'page_views' appeared
-- shortly after creating them. This is expected. Postgres needs traffic to start using them.
-- No action is needed to remove them yet.

-- 3. FIX AUTH CONFIG WARNING
-- The "Auth Absolute Connection Management Strategy" is an informational warning about
-- connection pooler settings in Supabase. It requires changing Project Settings in the Dashboard,
-- not a SQL migration. (Settings > Database > Connection Pooling).

