-- Add indexes to improve performance for CRM, Finance, and KV Store

-- KV Store (heavily used for Key-Value retrieval by prefix)
CREATE INDEX IF NOT EXISTS kv_store_key_idx ON public.kv_store_980dd7a4 (key);
-- Note: If using LIKE 'prefix%', a btree index with text_pattern_ops is ideal, 
-- but identifying the exact index type support without full access is tricky. 
-- Standard btree (default) often supports prefix search if locale is C, but safer to just add standard index.

-- CRM: Companies
CREATE INDEX IF NOT EXISTS companies_type_idx ON public.companies (type);
CREATE INDEX IF NOT EXISTS companies_status_idx ON public.companies (status);

-- CRM: Contacts
CREATE INDEX IF NOT EXISTS contacts_company_id_idx ON public.contacts (company_id);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON public.contacts (email);

-- CRM: Interactions
CREATE INDEX IF NOT EXISTS interactions_company_id_idx ON public.interactions (company_id);
CREATE INDEX IF NOT EXISTS interactions_contact_id_idx ON public.interactions (contact_id);
CREATE INDEX IF NOT EXISTS interactions_date_idx ON public.interactions (date);
CREATE INDEX IF NOT EXISTS interactions_type_idx ON public.interactions (type);

-- Finance: Invoices
CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON public.invoices (company_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices (status);
CREATE INDEX IF NOT EXISTS invoices_issue_date_idx ON public.invoices (issue_date);

-- Finance: Invoice Items
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON public.invoice_items (invoice_id);

-- Finance: Time Entries
CREATE INDEX IF NOT EXISTS time_entries_company_id_idx ON public.time_entries (company_id);
CREATE INDEX IF NOT EXISTS time_entries_invoice_id_idx ON public.time_entries (invoice_id);
CREATE INDEX IF NOT EXISTS time_entries_date_idx ON public.time_entries (date);
CREATE INDEX IF NOT EXISTS time_entries_status_idx ON public.time_entries (status);

-- Analytics: Page Views
CREATE INDEX IF NOT EXISTS page_views_slug_idx ON public.page_views (slug);
CREATE INDEX IF NOT EXISTS page_views_page_type_idx ON public.page_views (page_type);
