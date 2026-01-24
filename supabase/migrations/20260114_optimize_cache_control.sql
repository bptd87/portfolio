-- Update metadata for EXISTING files to force 1 year cache
-- This fixes the PageSpeed warning for images already uploaded
update storage.objects
set metadata = jsonb_set(metadata, '{cacheControl}', '"max-age=31536000"')
where bucket_id in (
  'portfolio', 
  'blog', 
  'news', 
  'avatars', 
  'misc', 
  'projects',
  'make-74296234-images',
  'Site Files'
);

-- Note: To set the default for NEW files, please check your 
-- Supabase Dashboard > Storage > [Bucket] > Configuration if this SQL fails for buckets.
-- The column `cache_control` might not exist in your legacy Supabase version.
