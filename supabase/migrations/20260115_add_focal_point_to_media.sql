-- Add focus_x and focus_y columns to media_library for focal point management
ALTER TABLE public.media_library 
ADD COLUMN IF NOT EXISTS focus_x NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS focus_y NUMERIC DEFAULT 50;

-- Update existing rows to have default values if they were null (though default should handle it)
UPDATE public.media_library SET focus_x = 50 WHERE focus_x IS NULL;
UPDATE public.media_library SET focus_y = 50 WHERE focus_y IS NULL;
