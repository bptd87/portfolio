-- Create Finance Tables

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  project_id UUID, -- Optional link to portfolio project
  number TEXT NOT NULL, -- e.g. INV-2025-001
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  subtotal NUMERIC(10, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  pdf_url TEXT
);

-- Invoice Items (Line Items)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID, -- Link to portfolio project or just generic text
  project_name TEXT, -- Fallback if not linked
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hours NUMERIC(5, 2) NOT NULL,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  rate NUMERIC(10, 2), -- Hourly rate snapshot
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL, -- Null = Unbilled
  status TEXT CHECK (status IN ('unbilled', 'invoiced', 'paid')) DEFAULT 'unbilled'
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON invoices FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON invoice_items FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON time_entries FOR SELECT USING (true);
CREATE POLICY "Allow admin full access" ON time_entries FOR ALL USING (true);
