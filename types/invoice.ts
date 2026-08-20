export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export type PlatformInvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type PlatformInvoice = {
  id: string;
  number: number;
  workspace_id?: string;
  workspace_name?: string;
  bill_to_name: string;
  bill_to_address: string;
  invoice_date: string; // YYYY-MM-DD
  payment_terms: string;
  po_number: string;
  notes: string;
  total_amount: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  items: PlatformInvoiceItem[];
};

export type PlatformInvoiceListResponse = {
  items: PlatformInvoice[];
  total: number;
};

export type InvoiceItemPayload = {
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceWritePayload = {
  workspace_id?: string | null;
  bill_to_name: string;
  bill_to_address: string;
  invoice_date: string;
  payment_terms: string;
  po_number: string;
  notes: string;
  items: InvoiceItemPayload[];
};
