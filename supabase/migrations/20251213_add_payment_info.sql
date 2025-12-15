-- Add payment_info column to invoices table to store Zelle ID or other payment details
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_info TEXT;
