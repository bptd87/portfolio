-- Complete Collaborators Setup and Migration
-- Run this entire file in Supabase Dashboard SQL Editor

-- STEP 1: Add missing columns to collaborators table
ALTER TABLE public.collaborators 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS projects TEXT[];

-- Create index for featured collaborators
CREATE INDEX IF NOT EXISTS collaborators_featured_idx ON public.collaborators(featured) WHERE featured = true;

-- STEP 2: Check what data exists in KV store (for verification)
DO $$
DECLARE
  kv_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO kv_count FROM kv_store_980dd7a4 WHERE key LIKE 'collaborator:%';
  RAISE NOTICE 'Found % collaborators in KV store', kv_count;
END $$;

-- STEP 3: Migrate collaborators from KV store to SQL table
INSERT INTO collaborators (
  name,
  type,
  role,
  bio,
  website,
  linkedin,
  instagram,
  image_url,
  featured,
  project_count,
  projects
)
SELECT 
  value->>'name',
  COALESCE(value->>'type', 'person')::TEXT,
  value->>'role',
  value->>'bio',
  value->>'website',
  value->>'linkedin',
  value->>'instagram',
  COALESCE(value->>'avatar', value->>'image_url'),
  COALESCE((value->>'featured')::BOOLEAN, false),
  COALESCE((value->>'projectCount')::INTEGER, 0),
  CASE 
    WHEN value->'projects' IS NOT NULL THEN 
      ARRAY(SELECT jsonb_array_elements_text(value->'projects'))
    ELSE NULL
  END
FROM kv_store_980dd7a4
WHERE key LIKE 'collaborator:%'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  website = EXCLUDED.website,
  linkedin = EXCLUDED.linkedin,
  instagram = EXCLUDED.instagram,
  image_url = EXCLUDED.image_url,
  featured = EXCLUDED.featured,
  project_count = EXCLUDED.project_count,
  projects = EXCLUDED.projects;

-- STEP 4: Verify the migration
SELECT COUNT(*) as total_collaborators FROM collaborators;
SELECT name, type, role, featured, website, linkedin, instagram FROM collaborators ORDER BY name;
