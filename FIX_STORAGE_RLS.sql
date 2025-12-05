-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public listing of buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow public listing of files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- 1. Allow public access to list all buckets
CREATE POLICY "Allow public listing of buckets"
ON storage.buckets
FOR SELECT
TO public
USING (true);

-- 2. Allow public access to list all files in all buckets
CREATE POLICY "Allow public listing of files"
ON storage.objects
FOR SELECT
TO public
USING (true);

-- 3. Allow authenticated users (Admin) to upload/delete files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);
