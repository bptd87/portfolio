-- Create social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    enabled BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    type TEXT DEFAULT 'link', -- 'social' or 'link'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on social_links"
    ON public.social_links
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin all access on social_links"
    ON public.social_links
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create profile table (for bio)
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for profile
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on profile"
  ON public.profile
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin all access on profile"
  ON public.profile
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed defaults
INSERT INTO public.profile (name, tagline)
SELECT 'BRANDON PT DAVIS', 'Scenic Designer'
WHERE NOT EXISTS (SELECT 1 FROM public.profile);

INSERT INTO public.social_links (title, url, icon, "order", type, enabled)
VALUES 
('Instagram', 'https://instagram.com/brandonptdavis', 'instagram', 1, 'social', true),
('LinkedIn', 'https://linkedin.com/in/brandonptdavis', 'linkedin', 2, 'social', true)
ON CONFLICT DO NOTHING;
