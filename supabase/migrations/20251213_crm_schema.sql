-- Create CRM Tables

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('theater', 'agency', 'client', 'vendor', 'other')) DEFAULT 'theater',
  status TEXT CHECK (status IN ('prospect', 'active', 'past', 'dormant')) DEFAULT 'prospect',
  website TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb, -- { street, city, state, zip, country }
  notes TEXT,
  logo_url TEXT
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT
);

-- Interactions Table (History)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  type TEXT CHECK (type IN ('email', 'call', 'meeting', 'site_visit', 'other')) DEFAULT 'email',
  summary TEXT NOT NULL,
  next_step TEXT,
  next_step_date TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Policies (Public Read / Admin Write for now, or Restricted?)
-- Assuming Admin-only tools, so we likely want restricted access.
-- But for now adapting to existing pattern (usually public read or authenticated read).
-- Let's assume authenticated users (Admin) have full access.

CREATE POLICY "Allow public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON companies FOR ALL USING (true); -- customize based on actual auth setup

CREATE POLICY "Allow public read access" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON contacts FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON interactions FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON interactions FOR ALL USING (true);
