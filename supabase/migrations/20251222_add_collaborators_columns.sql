-- Add missing columns to collaborators table for original design
ALTER TABLE public.collaborators 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS projects TEXT[];

-- Create index for featured collaborators
CREATE INDEX IF NOT EXISTS collaborators_featured_idx ON public.collaborators(featured) WHERE featured = true;

-- Update RLS policies to allow all fields
DROP POLICY IF EXISTS "Admin all collaborators" ON public.collaborators;
CREATE POLICY "Admin all collaborators" ON public.collaborators 
  FOR ALL 
  USING (auth.role() = 'authenticated');
