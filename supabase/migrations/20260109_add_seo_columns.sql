-- Add SEO columns to portfolio_projects
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS card_image_alt TEXT;

-- Update RLS policies (if needed, but usually existing policies cover new columns)
-- Existing policies:
-- "Public can view published projects" (SELECT)
-- "Admins can insert projects" (INSERT)
-- "Admins can update projects" (UPDATE)
-- "Admins can delete projects" (DELETE)
