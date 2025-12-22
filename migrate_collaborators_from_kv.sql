-- Migrate collaborators from KV store to SQL table
-- Run this in Supabase Dashboard SQL Editor

-- First, check what data exists
SELECT 
  key,
  value->>'name' as name,  
  value->>'type' as type,
  value->>'role' as role
FROM kv_store_980dd7a4 
WHERE key LIKE 'collaborator:%'
ORDER BY key;

-- Then run the migration
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
ON CONFLICT DO NOTHING;

-- Verify the migration
SELECT COUNT(*) as migrated_count FROM collaborators;
SELECT name, type, role, featured FROM collaborators ORDER BY name;
