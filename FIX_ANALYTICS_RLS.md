# Fix Analytics Permissions

The issue is that the initial setup restricted viewing analytics to "Authenticated Users" (Supabase Auth), but your Admin Panel uses a custom password system that doesn't log you into Supabase directly. Therefore, the database thinks you are an "Anonymous" user and blocks the read request.

To fix this, we need to update the policy to allow the Admin Dashboard (running as a client) to read the data.

## Instructions

1.  **Go to your Supabase Dashboard** and open the **SQL Editor**.
2.  **Paste and Run** the following code:

```sql
-- Drop the restrictive policy
drop policy if exists "Allow admins to view analytics" on public.page_views;

-- Create a new policy allowing anonymous read access
-- (This allows the Admin Dashboard to fetch the data without a Supabase Auth session)
create policy "Allow public read access"
  on public.page_views
  for select
  to anon
  using (true);
```

## Verification

1.  After running the SQL, reload your **Admin Dashboard**.
2.  The charts should now populate with the data you generated.
