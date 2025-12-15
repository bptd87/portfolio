-- Allow public read access to page_views
-- This is required because the Admin Dashboard runs as a client-side app (anon) 
-- and needs to fetch the data to display the charts.

DROP POLICY IF EXISTS "Allow admins to view analytics" ON public.page_views;
DROP POLICY IF EXISTS "Allow public read access" ON public.page_views;

-- Create a comprehensive read policy for public (includes anon and authenticated)
CREATE POLICY "Allow public read access"
  ON public.page_views
  FOR SELECT
  TO public
  USING (true);
