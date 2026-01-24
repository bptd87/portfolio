-- Add notes column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;
