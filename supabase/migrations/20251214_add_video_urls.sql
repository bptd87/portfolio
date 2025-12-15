-- Add video_urls column if it doesn't exist
ALTER TABLE portfolio_projects 
ADD COLUMN IF NOT EXISTS video_urls TEXT[];
