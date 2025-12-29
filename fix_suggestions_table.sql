
-- Safely setup suggestions table and policies
-- 1. Create table if missing
CREATE TABLE IF NOT EXISTS public.directory_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category_slug TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.directory_suggestions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public insert suggestions" ON public.directory_suggestions;
DROP POLICY IF EXISTS "Admin manage suggestions" ON public.directory_suggestions;

-- 4. Re-create policies correctly
-- Allow ANYONE (including anonymous users) to insert suggestions
CREATE POLICY "Public insert suggestions" ON public.directory_suggestions FOR INSERT WITH CHECK (true);

-- Allow Admin/Authenticated users to view and manage
CREATE POLICY "Admin manage suggestions" ON public.directory_suggestions USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
