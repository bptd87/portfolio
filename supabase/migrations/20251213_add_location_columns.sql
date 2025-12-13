-- Add location columns to page_views table
alter table public.page_views 
add column if not exists city text,
add column if not exists region text,
add column if not exists country text;

-- Create index for location queries
create index if not exists page_views_country_idx on public.page_views (country);
