-- Add cover_image_focal_point column to articles table if it doesn't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS cover_image_focal_point jsonb;
