-- Fix tutorials RLS policy to enable DELETE operations
-- The original policy only had USING clause which doesn't apply to DELETE

-- Drop all existing admin policies for tutorials (in case they exist)
DROP POLICY IF EXISTS "Admin all tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admin select tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admin insert tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admin update tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admin delete tutorials" ON public.tutorials;

-- Create separate policies for each operation with authenticated users
-- These policies will allow all CRUD operations for authenticated users

CREATE POLICY "Admin select tutorials" 
ON public.tutorials
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin insert tutorials" 
ON public.tutorials
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin update tutorials" 
ON public.tutorials
FOR UPDATE  
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin delete tutorials" 
ON public.tutorials
FOR DELETE
TO authenticated
USING (true);
