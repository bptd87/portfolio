-- Add month column to portfolio_projects table
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS month INTEGER;

-- Update existing rows to have a default month if needed (optional, using Jan/1)
-- UPDATE public.portfolio_projects SET month = 1 WHERE month IS NULL;
