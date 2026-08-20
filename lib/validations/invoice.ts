import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(500, "Deskripsi terlalu panjang"),
  quantity: z.number({ message: "Quantity harus angka" }).nonnegative("Quantity harus 0 atau lebih"),
  rate: z.number({ message: "Rate harus angka" }).nonnegative("Rate harus 0 atau lebih"),
});

export const invoiceSchema = z.object({
  workspace_id: z.string().optional(),
  bill_to_name: z.string().trim().min(1, "Bill To wajib diisi").max(200, "Bill To terlalu panjang"),
  bill_to_address: z.string().max(1000, "Alamat terlalu panjang"),
  invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi"),
  payment_terms: z.string().max(64, "Payment terms terlalu panjang"),
  po_number: z.string().max(64, "PO number terlalu panjang"),
  notes: z.string().max(1000, "Catatan terlalu panjang"),
  items: z.array(invoiceItemSchema).min(1, "Minimal satu item").max(50, "Maksimal 50 item"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;

export const INVOICE_STATUS_LABELS: Record<(typeof INVOICE_STATUSES)[number], string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
  void: "Batal",
};
