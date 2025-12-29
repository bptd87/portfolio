
-- Add likes column if it doesn't exist
ALTER TABLE public.directory_links 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create secure increment function (allows public participation)
CREATE OR REPLACE FUNCTION increment_directory_link_likes(link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.directory_links
  SET likes = likes + 1
  WHERE id = link_id;
END;
$$;
