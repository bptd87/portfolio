-- Add missing columns to the news table for rich content
-- Run this in the Supabase SQL Editor

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS link text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blocks jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]';

-- Optional: Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
