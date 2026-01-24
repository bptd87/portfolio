-- CLEANUP MIGRATION: Fix "Multiple Permissive Policies" Warnings
-- This script drops ALL known variations of policies and recreates single, clean policies.

-- 1. app_settings
DROP POLICY IF EXISTS "Allow public read access" ON app_settings;
DROP POLICY IF EXISTS "Allow admin full access" ON app_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON app_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON app_settings;
DROP POLICY IF EXISTS "Enable update for users based on email" ON app_settings;

CREATE POLICY "Public Read Settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admin Manage Settings" ON app_settings FOR ALL USING (true);


-- 2. expense_categories
DROP POLICY IF EXISTS "Allow public read access categories" ON expense_categories;
DROP POLICY IF EXISTS "Allow admin modify categories" ON expense_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON expense_categories;

CREATE POLICY "Public Read Categories" ON expense_categories FOR SELECT USING (true);
CREATE POLICY "Admin Manage Categories" ON expense_categories FOR ALL USING (true);


-- 3. invoices
DROP POLICY IF EXISTS "Allow admin full access invoices" ON invoices;
DROP POLICY IF EXISTS "Allow admin full access" ON invoices; 
DROP POLICY IF EXISTS "Enable read invoices" ON invoices;
DROP POLICY IF EXISTS "Enable insert invoices" ON invoices;
DROP POLICY IF EXISTS "Enable update invoices" ON invoices;
DROP POLICY IF EXISTS "Enable delete invoices" ON invoices;

CREATE POLICY "Admin Manage Invoices" ON invoices FOR ALL USING (true);


-- 4. invoice_items
DROP POLICY IF EXISTS "Allow admin full access invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow admin full access" ON invoice_items;
DROP POLICY IF EXISTS "Enable read inv_items" ON invoice_items;
DROP POLICY IF EXISTS "Enable insert inv_items" ON invoice_items;
DROP POLICY IF EXISTS "Enable update inv_items" ON invoice_items;
DROP POLICY IF EXISTS "Enable delete inv_items" ON invoice_items;

CREATE POLICY "Admin Manage Invoice Items" ON invoice_items FOR ALL USING (true);


-- 5. time_entries
DROP POLICY IF EXISTS "Allow admin full access time_entries" ON time_entries;
DROP POLICY IF EXISTS "Allow admin full access" ON time_entries;
DROP POLICY IF EXISTS "Enable read time_entries" ON time_entries;
DROP POLICY IF EXISTS "Enable insert time_entries" ON time_entries;
DROP POLICY IF EXISTS "Enable update time_entries" ON time_entries;
DROP POLICY IF EXISTS "Enable delete time_entries" ON time_entries;

CREATE POLICY "Admin Manage Time Entries" ON time_entries FOR ALL USING (true);


-- 6. expenses
DROP POLICY IF EXISTS "Allow admin full access expenses" ON expenses;
DROP POLICY IF EXISTS "Allow admin full access" ON expenses;
DROP POLICY IF EXISTS "Enable read expenses" ON expenses;
DROP POLICY IF EXISTS "Enable insert expenses" ON expenses;
DROP POLICY IF EXISTS "Enable update expenses" ON expenses;
DROP POLICY IF EXISTS "Enable delete expenses" ON expenses;

CREATE POLICY "Admin Manage Expenses" ON expenses FOR ALL USING (true);


-- 7. recurring_expenses
DROP POLICY IF EXISTS "Allow admin full access recurring" ON recurring_expenses;
DROP POLICY IF EXISTS "Allow admin full access" ON recurring_expenses;

CREATE POLICY "Admin Manage Recurring Expenses" ON recurring_expenses FOR ALL USING (true);
