-- Add month column to portfolio_projects for granular sorting
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month >= 1 AND month <= 12);
