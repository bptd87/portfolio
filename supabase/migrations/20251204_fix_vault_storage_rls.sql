-- Fix Vault Storage RLS Policies
-- Run this in Supabase SQL Editor

-- Drop existing policies on vault bucket if they exist
DROP POLICY IF EXISTS "Allow public read on vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on vault" ON storage.objects;
DROP POLICY IF EXISTS "vault_public_read" ON storage.objects;
DROP POLICY IF EXISTS "vault_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "vault_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "vault_auth_delete" ON storage.objects;

-- Create policies for vault bucket

-- Allow anyone to read (download) files from vault
CREATE POLICY "vault_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vault');

-- Allow authenticated users to upload files to vault
CREATE POLICY "vault_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vault');

-- Allow authenticated users to update files in vault
CREATE POLICY "vault_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vault');

-- Allow authenticated users to delete files from vault
CREATE POLICY "vault_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vault');

-- Alternative: Allow service role / anon key with specific paths
-- If the above doesn't work, use these more permissive policies:

-- DROP POLICY IF EXISTS "vault_public_read" ON storage.objects;
-- DROP POLICY IF EXISTS "vault_auth_insert" ON storage.objects;
-- DROP POLICY IF EXISTS "vault_auth_update" ON storage.objects;
-- DROP POLICY IF EXISTS "vault_auth_delete" ON storage.objects;

-- CREATE POLICY "vault_allow_all_read"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'vault');

-- CREATE POLICY "vault_allow_all_insert"
-- ON storage.objects FOR INSERT
-- TO public
-- WITH CHECK (bucket_id = 'vault');

-- CREATE POLICY "vault_allow_all_update"
-- ON storage.objects FOR UPDATE
-- TO public
-- USING (bucket_id = 'vault');

-- CREATE POLICY "vault_allow_all_delete"
-- ON storage.objects FOR DELETE
-- TO public
-- USING (bucket_id = 'vault');
