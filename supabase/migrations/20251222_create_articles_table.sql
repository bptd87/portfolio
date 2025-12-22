-- Create articles table for Scenic Insights
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content JSONB, -- For rich text content
    blocks JSONB, -- For structured blocks if needed
    category TEXT, -- Foreign key to categories(slug) or just text
    tags TEXT[],
    cover_image TEXT,
    published BOOLEAN DEFAULT true,
    author TEXT,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (published = true);

-- Admin policies
CREATE POLICY "Admin all articles" ON public.articles USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
