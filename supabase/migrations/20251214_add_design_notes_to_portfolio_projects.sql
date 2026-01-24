-- Add design_notes column to portfolio_projects
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS design_notes TEXT[] DEFAULT '{}';
