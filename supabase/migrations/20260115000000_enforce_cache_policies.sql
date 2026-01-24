-- Update Existing Files ONLY (Retrospective Fix)
-- Your Supabase version does not have a 'cache_control' column on the buckets table yet.
-- This query bypasses that error and fixes the files directly.

update storage.objects
set metadata = jsonb_set(metadata, '{cacheControl}', '"max-age=31536000"')
where bucket_id in ('portfolio', 'blog', 'news', 'avatars', 'projects', 'make-74296234-images', 'Site Files');
