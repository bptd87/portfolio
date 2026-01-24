-- Add columns for Rendering & Visualization projects
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS software_used TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_overview TEXT;
