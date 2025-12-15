-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT,
    frequency TEXT CHECK (frequency IN ('monthly', 'yearly')),
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    last_generated_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow all for authenticated users on recurring_expenses" ON recurring_expenses;
CREATE POLICY "Allow all for authenticated users on recurring_expenses"
ON recurring_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to check and insert recurring expenses
-- This is complex to do purely in SQL without a cron, so we will rely on Client-Side check on load for simplicity in this V1.
-- But we can add a helper function to bulk insert if needed. For now, client side is fine.
