-- Add missing focal point column to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS cover_image_focal_point jsonb DEFAULT '{"x": 50, "y": 50}';

-- Force schema cache reload (Supabase specific trick: notify pgrst)
NOTIFY pgrst, 'reload config';
