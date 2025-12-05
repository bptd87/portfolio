-- Create a table to track page views
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  page_type text, -- 'project', 'blog', 'home', etc.
  slug text,      -- specific resource identifier
  referrer text,
  user_agent text,
  screen_width integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.page_views enable row level security;

-- Allow anyone (anon) to insert page views
create policy "Allow anonymous inserts"
  on public.page_views
  for insert
  to anon
  with check (true);

-- Allow only authenticated admins to view analytics
create policy "Allow admins to view analytics"
  on public.page_views
  for select
  to authenticated
  using (true);

-- Create an index for faster querying by date
create index if not exists page_views_created_at_idx on public.page_views (created_at);
create index if not exists page_views_path_idx on public.page_views (path);
