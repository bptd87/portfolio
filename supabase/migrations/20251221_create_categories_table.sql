-- Create categories table for organizing content
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT,
    type TEXT NOT NULL, -- 'portfolio', 'articles', or 'news'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(type, slug)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "Public read categories" 
ON public.categories FOR SELECT 
USING (true);

-- Admins can manage categories
CREATE POLICY "Admin all categories" 
ON public.categories 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO public.categories (name, slug, color, type) VALUES
    ('Theatre', 'theatre', '#3B82F6', 'portfolio'),
    ('Opera', 'opera', '#8B5CF6', 'portfolio'),
    ('Dance', 'dance', '#EC4899', 'portfolio'),
    ('Design Philosophy', 'design-philosophy', '#10B981', 'articles'),
    ('Technical Tutorials', 'technical-tutorials', '#F59E0B', 'articles'),
    ('Career Milestone', 'career-milestone', '#3B82F6', 'news'),
    ('Publication', 'publication', '#8B5CF6', 'news')
ON CONFLICT (type, slug) DO NOTHING;
