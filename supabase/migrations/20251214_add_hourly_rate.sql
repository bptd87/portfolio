-- Add default_hourly_rate to app_settings
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS default_hourly_rate NUMERIC(10, 2) DEFAULT 100.00;
