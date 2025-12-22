-- Create articles/posts table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content JSONB,
    category TEXT,
    cover_image TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time TEXT,
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles"
ON public.articles FOR SELECT
USING (published = true);

CREATE POLICY "Admins can insert articles"
ON public.articles FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can update articles"
ON public.articles FOR UPDATE
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- RPC for incrementing Project counters
CREATE OR REPLACE FUNCTION increment_project_view(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET views = COALESCE(views, 0) + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_project_like(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for incrementing Article counters
CREATE OR REPLACE FUNCTION increment_article_view(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_article_like(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
