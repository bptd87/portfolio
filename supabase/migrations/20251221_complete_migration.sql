-- Run this in Supabase SQL Editor to complete the migration

-- 1. Add missing columns to news table (if not already added)
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS blocks JSONB,
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Create articles table for Scenic Insights (if not exists)
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

-- 3. Create vault_assets table (if not exists)
CREATE TABLE IF NOT EXISTS public.vault_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    dimensions TEXT,
    material TEXT,
    condition TEXT,
    location TEXT,
    notes TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_assets ENABLE ROW LEVEL SECURITY;

-- 5. Add policies for articles
CREATE POLICY IF NOT EXISTS "Public can view published articles"
ON public.articles FOR SELECT
USING (published = true);

CREATE POLICY IF NOT EXISTS "Admins can insert articles"
ON public.articles FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admins can update articles"
ON public.articles FOR UPDATE
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 6. Add policies for vault_assets
CREATE POLICY IF NOT EXISTS "Public can view published vault assets"
ON public.vault_assets FOR SELECT
USING (published = true);

CREATE POLICY IF NOT EXISTS "Admins can insert vault assets"
ON public.vault_assets FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admins can update vault assets"
ON public.vault_assets FOR UPDATE
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 7. Create RPC functions for article counters
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
