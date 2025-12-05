-- 1. Fix Analytics Permissions (Allow Admin Panel to view stats)
DROP POLICY IF EXISTS "Allow admins to view analytics" ON public.page_views;
DROP POLICY IF EXISTS "Allow public read access" ON public.page_views;

CREATE POLICY "Allow public read access"
  ON public.page_views
  FOR SELECT
  TO anon
  USING (true);

-- 2. Fix Storage Permissions (Allow Admin Panel to list files)
DROP POLICY IF EXISTS "Allow public listing of buckets" ON storage.buckets;
CREATE POLICY "Allow public listing of buckets"
ON storage.buckets
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow public listing of files" ON storage.objects;
CREATE POLICY "Allow public listing of files"
ON storage.objects
FOR SELECT
TO public
USING (true);

-- 3. Allow Admin to Upload/Delete (Authenticated via Service Role or if Auth is fixed later)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);

-- 4. Media Library Permissions (Read-only for public, Write via Server)
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media metadata" ON public.media_library;
CREATE POLICY "Public can read media metadata"
ON public.media_library
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admin can manage media metadata" ON public.media_library;

