-- Create Scenic Vault storage bucket
-- Run this in Supabase SQL Editor

-- Create the vault storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault',
  'vault',
  true,
  52428800, -- 50MB limit for VWX files
  ARRAY[
    'application/octet-stream',
    'model/gltf-binary',
    'model/gltf+json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/octet-stream',
    'model/gltf-binary',
    'model/gltf+json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ];

-- Allow public read access to vault files
CREATE POLICY IF NOT EXISTS "Public read access for vault"
ON storage.objects FOR SELECT
USING (bucket_id = 'vault');

-- Allow authenticated uploads (admin only via RLS)
CREATE POLICY IF NOT EXISTS "Admin upload access for vault"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vault');

-- Allow authenticated updates
CREATE POLICY IF NOT EXISTS "Admin update access for vault"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vault');

-- Allow authenticated deletes
CREATE POLICY IF NOT EXISTS "Admin delete access for vault"
ON storage.objects FOR DELETE
USING (bucket_id = 'vault');

-- Grant permissions
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
