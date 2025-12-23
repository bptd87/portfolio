-- Add performance indexes recommended by Supabase Index Advisor

-- 1. Portfolio Projects: Frequent sorting by year
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_year ON public.portfolio_projects USING btree (year DESC);

-- 2. News: Frequent sorting by date
CREATE INDEX IF NOT EXISTS idx_news_date ON public.news USING btree (date DESC);

-- 3. Categories: Frequent filtering/sorting by type
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories USING btree (type);

-- 4. Articles: Frequent sorting by published_at (Proactive addition)
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles USING btree (published_at DESC);

-- 5. Published Status: Helpful for almost all public queries (Proactive addition)
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_published ON public.portfolio_projects (published);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles (published);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news (published);
