-- Add cover_image_alt_text to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS cover_image_alt_text TEXT;
