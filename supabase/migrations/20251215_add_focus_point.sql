-- Add focus_point column to portfolio_projects
ALTER TABLE public.portfolio_projects
ADD COLUMN IF NOT EXISTS focus_point JSONB DEFAULT '{"x": 50, "y": 50}'::jsonb;