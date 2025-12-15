export type CompanyType = 'theater' | 'agency' | 'client' | 'vendor' | 'other';
export type CompanyStatus = 'prospect' | 'active' | 'past' | 'dormant';

export interface Company {
  id: string;
  created_at?: string;
  name: string;
  type: CompanyType;
  status: CompanyStatus;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  logo_url?: string;
}

export interface Contact {
  id: string;
  created_at?: string;
  company_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
}

export type InteractionType = 'email' | 'call' | 'meeting' | 'site_visit' | 'other';

export interface Interaction {
  id: string;
  created_at?: string;
  company_id: string;
  contact_id?: string; // Optional link to specific person
  date: string; // ISO date string
  type: InteractionType;
  summary: string;
  notes?: string; // Alias for summary in UI if needed, or separate field? split summary and notes? DB has summary.
  next_step?: string;
  next_step_date?: string;
}

// Finance Types

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  created_at?: string;
  company_id: string;
  project_id?: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  pdf_url?: string;
  items?: InvoiceItem[];
  company?: Company; // Joined
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export type TimeEntryStatus = 'unbilled' | 'invoiced' | 'paid';

export interface TimeEntry {
  id: string;
  created_at?: string;
  project_id?: string;
  project_name?: string;
  company_id?: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  rate?: number;
  invoice_id?: string;
  status: TimeEntryStatus;
  company?: Company; // Joined
}
