-- ==========================================
-- FIX FOR LIKE BUTTON FUNCTIONALITY
-- Run this entire script in the Supabase SQL Editor
-- ==========================================

-- 1. Increment Project Like
CREATE OR REPLACE FUNCTION increment_project_like(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Decrement Project Like
CREATE OR REPLACE FUNCTION decrement_project_like(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Increment Article Like
CREATE OR REPLACE FUNCTION increment_article_like(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Decrement Article Like
CREATE OR REPLACE FUNCTION decrement_article_like(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Increment Project View (Ensure this exists too)
CREATE OR REPLACE FUNCTION increment_project_view(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET views = COALESCE(views, 0) + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Increment Article View
CREATE OR REPLACE FUNCTION increment_article_view(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh schema cache (implicit in Supabase usually, but good to know)
NOTIFY pgrst, 'reload config';
