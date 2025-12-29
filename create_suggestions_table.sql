
-- Table for user suggestions
CREATE TABLE IF NOT EXISTS public.directory_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category_slug TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.directory_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (submit)
CREATE POLICY "Public insert suggestions" ON public.directory_suggestions FOR INSERT WITH CHECK (true);

-- Allow admins to view/manage
CREATE POLICY "Admin manage suggestions" ON public.directory_suggestions USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
