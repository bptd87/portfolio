-- Update the category check constraint to include all used categories
ALTER TABLE public.portfolio_projects DROP CONSTRAINT IF EXISTS portfolio_projects_category_check;

ALTER TABLE public.portfolio_projects ADD CONSTRAINT portfolio_projects_category_check 
CHECK (category IN (
  'Scenic Design', 
  'Experiential Design', 
  'Design Documentation', 
  'Rendering & Visualization',
  'Archive'
));
