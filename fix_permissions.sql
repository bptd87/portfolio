-- FIX PERMISSIONS SCRIPT
-- Run this in your Supabase Dashboard > SQL Editor
-- This fixes the "401 Unauthorized" error by enabling public read access

-- 1. Enable Row Level Security (good practice, required for policies)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public read access" ON articles;
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Anon read access" ON articles;

DROP POLICY IF EXISTS "Public read access" ON categories;
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Anon read access" ON categories;

-- 3. Create permissive read policies for public users (anon) and logged in users
CREATE POLICY "Public read access"
ON articles FOR SELECT
TO anon, authenticated
USING (true); -- Change to (published = true) if you want to hide drafts from API

CREATE POLICY "Public read access"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- 4. FIX DATA: Ensure existing articles are visible
-- If 'published' is NULL, they default to hidden in our frontend filter
UPDATE articles SET published = true WHERE published IS NULL;

-- 5. Grant permissions to the anon role explicitly (just in case)
GRANT SELECT ON articles TO anon;
GRANT SELECT ON categories TO anon;
