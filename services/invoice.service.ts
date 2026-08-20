import { api, downloadFile } from "@/lib/axios";
import type {
  InvoiceStatus,
  InvoiceWritePayload,
  PlatformInvoice,
  PlatformInvoiceListResponse,
} from "@/types";

export type ListInvoicesParams = {
  workspace_id?: string;
  status?: InvoiceStatus | "";
  q?: string;
  limit?: number;
  offset?: number;
};

export const InvoiceService = {
  getInvoices: async (params?: ListInvoicesParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.workspace_id) searchParams.append("workspace_id", params.workspace_id);
      if (params.status) searchParams.append("status", params.status);
      if (params.q) searchParams.append("q", params.q);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    return api<PlatformInvoiceListResponse>(`/platform-invoices${query ? `?${query}` : ""}`);
  },

  getInvoice: async (id: string) =>
    api<PlatformInvoice>(`/platform-invoices/${encodeURIComponent(id)}`),

  createInvoice: async (payload: InvoiceWritePayload) =>
    api<PlatformInvoice>("/platform-invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateInvoice: async (id: string, payload: InvoiceWritePayload) =>
    api<PlatformInvoice>(`/platform-invoices/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  setInvoiceStatus: async (id: string, status: InvoiceStatus) =>
    api<PlatformInvoice>(`/platform-invoices/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteInvoice: async (id: string) =>
    api(`/platform-invoices/${encodeURIComponent(id)}`, { method: "DELETE" }),

  downloadInvoicePdf: async (invoice: Pick<PlatformInvoice, "id" | "number" | "invoice_date">) =>
    downloadFile(
      `/platform-invoices/${encodeURIComponent(invoice.id)}/pdf`,
      `invoice-${invoice.number}-${invoice.invoice_date}.pdf`,
    ),
};
