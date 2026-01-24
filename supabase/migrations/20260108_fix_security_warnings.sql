-- Fix Supabase Security Warnings (Minimal - Comments Only)
-- Generated: 2026-01-08
-- Only fixes the comments table which we know exists with correct schema
-- Skips other tables to avoid schema mismatch errors

-- ============================================================================
-- Comments Table - Add Basic Validation
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;

CREATE POLICY "Public can insert comments with validation"
ON public.comments
FOR INSERT
TO public
WITH CHECK (
  content IS NOT NULL AND 
  content != '' AND
  length(content) < 5000
);

-- ============================================================================
-- NOTE: Other tables skipped due to unknown/mismatched schemas
-- ============================================================================
-- The following tables were flagged by the security linter but have
-- unknown schemas or don't exist in the database:
-- - directory_suggestions (column names unknown)
-- - crm_contacts (may not exist)
-- - kv_store_980dd7a4 (may not exist)
-- - page_views (column names unknown)
-- - tutorials (may not exist)
--
-- These should be fixed manually after verifying table schemas.
-- Run this to check what columns exist:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'your_table_name';
