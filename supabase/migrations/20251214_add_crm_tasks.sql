-- Create crm_tasks table
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal'
);

-- Enable RLS
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admin Manage Tasks" ON crm_tasks FOR ALL USING (true);
