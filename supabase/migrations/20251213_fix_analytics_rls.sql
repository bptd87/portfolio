-- Fix RLS policy to allow both anon and authenticated users to track page views

-- Drop the old restricted policy if it exists
drop policy if exists "Allow anonymous inserts" on public.page_views;

-- Create a new comprehensive policy
create policy "Allow public inserts"
  on public.page_views
  for insert
  to public
  with check (true);
