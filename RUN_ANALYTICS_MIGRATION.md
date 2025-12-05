# Run Analytics Migration

To enable the analytics features, you need to create the `page_views` table in your Supabase database.

## Instructions

1.  **Log in** to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`brandonptdaviscom`).
3.  Go to the **SQL Editor** (icon looks like a terminal `>_` on the left sidebar).
4.  Click **New Query**.
5.  **Copy and Paste** the SQL code below into the editor.
6.  Click **Run** (bottom right of the editor).

## SQL Code

```sql
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
```

## Verification

After running the SQL:
1.  Go to the **Table Editor** in Supabase.
2.  You should see a new table named `page_views`.
3.  Reload your local Admin Dashboard to see the analytics (it will be empty initially).
