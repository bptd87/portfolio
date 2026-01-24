-- Add payment_qr_url column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;
