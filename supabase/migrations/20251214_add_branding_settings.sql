-- Add branding fields to app_settings
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS business_name text DEFAULT 'BRANDON P. DAVIS';
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS business_address jsonb DEFAULT '{"street": "", "city": "", "state": "", "zip": "", "country": "USA"}';
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS business_website text DEFAULT 'www.brandonptdavis.com';
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS invoice_footer_note text DEFAULT 'Thank you for your business.';
