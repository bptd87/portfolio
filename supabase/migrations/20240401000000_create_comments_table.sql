-- Create comments table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references articles(id) on delete cascade not null,
  content text not null,
  author_name text,
  user_id uuid references auth.users(id) on delete set null,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- Policy 1: Public read of 'approved' comments
create policy "Comments are viewable by everyone if approved"
  on comments for select
  using (status = 'approved');

-- Policy 2: Anon insert allowed
create policy "Anyone can insert comments"
  on comments for insert
  with check (true);

-- Policy 3: Authors can view their own pending comments (optional but good)
create policy "Authors can view their own comments"
  on comments for select
  using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists comments_article_id_idx on comments(article_id);
