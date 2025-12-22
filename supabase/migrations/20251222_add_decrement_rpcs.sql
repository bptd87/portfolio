-- RPC for decrementing Project likes
CREATE OR REPLACE FUNCTION decrement_project_like(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.portfolio_projects
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for decrementing Article likes
CREATE OR REPLACE FUNCTION decrement_article_like(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
