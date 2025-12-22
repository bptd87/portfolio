-- Create tables for remaining features
CREATE TABLE IF NOT EXISTS public.news (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content JSONB,
    blocks JSONB, -- For structured content blocks
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT, -- e.g., "Career Milestone", "Publication/Feature", etc.
    tags TEXT[], -- Array of tags
    cover_image TEXT,
    link TEXT, -- External link if applicable
    location TEXT, -- Location/venue if applicable
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB,
    video_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[],
    category TEXT,
    published BOOLEAN DEFAULT true,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    instagram TEXT,
    image_url TEXT,
    type TEXT, -- person, company, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bio_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    "order" INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_configuration (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configuration ENABLE ROW LEVEL SECURITY;

-- Add basic policies (Public Read, Admin Write)
-- Note: Adjust policies based on your auth model. Here we assume public read for most.
CREATE POLICY "Public read news" ON public.news FOR SELECT USING (published = true);
CREATE POLICY "Public read tutorials" ON public.tutorials FOR SELECT USING (published = true);
CREATE POLICY "Public read collaborators" ON public.collaborators FOR SELECT USING (true);
CREATE POLICY "Public read bio_links" ON public.bio_links FOR SELECT USING (enabled = true);
CREATE POLICY "Public read configuration" ON public.site_configuration FOR SELECT USING (true);

-- Admin policies (Authenticated or Service Role)
CREATE POLICY "Admin all news" ON public.news USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Admin all tutorials" ON public.tutorials USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Admin all collaborators" ON public.collaborators USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Admin all bio_links" ON public.bio_links USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Admin all configuration" ON public.site_configuration USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
