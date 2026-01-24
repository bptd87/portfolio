-- Add missing geolocation columns to page_views table
-- This fixes the error where AnalyticsTracker tries to insert city/region/country but the columns don't exist.

ALTER TABLE public.page_views 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add index for country to query analytics by location later
CREATE INDEX IF NOT EXISTS page_views_country_idx ON public.page_views (country);
