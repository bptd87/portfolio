-- Create a table to store metadata for media files
-- This allows us to "globally manage" alt text, captions, etc.
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_path TEXT NOT NULL, -- The full path in storage (e.g., 'bucket/folder/file.jpg')
    bucket_id TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    seo_description TEXT,
    tags TEXT[], -- Array of strings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_id, file_path)
);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can READ metadata (so the website can display alt text)
CREATE POLICY "Public can read media metadata"
ON public.media_library
FOR SELECT
TO public
USING (true);

-- Authenticated users (Admin) can INSERT/UPDATE/DELETE
CREATE POLICY "Admin can manage media metadata"
ON public.media_library
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create an index for faster lookups by path
CREATE INDEX IF NOT EXISTS idx_media_library_path ON public.media_library(bucket_id, file_path);
