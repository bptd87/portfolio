-- Fix Companies Table Schema (Ensure columns exist)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'prospect',
  type TEXT DEFAULT 'theatre',
  website TEXT,
  address JSONB DEFAULT '{"city": "", "state": "", "country": "USA"}'
);

-- Ensure columns exist if table was already created
ALTER TABLE companies ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'theatre';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{"city": "", "state": "", "country": "USA"}';

-- Create crm_contacts table
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow admin full access companies" ON companies;
CREATE POLICY "Allow admin full access companies" ON companies FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin full access crm_contacts" ON crm_contacts;
CREATE POLICY "Allow admin full access crm_contacts" ON crm_contacts FOR ALL USING (true);
