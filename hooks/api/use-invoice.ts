import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceService, type ListInvoicesParams } from "@/services/invoice.service";
import type { InvoiceStatus, InvoiceWritePayload, PlatformInvoice } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const invoiceQK = {
  all: ["platform-invoices"] as const,
  lists: () => [...invoiceQK.all, "list"] as const,
  list: (params?: ListInvoicesParams) => [...invoiceQK.lists(), params] as const,
  details: () => [...invoiceQK.all, "detail"] as const,
  detail: (id: string) => [...invoiceQK.details(), id] as const,
};

export function useInvoices(params?: ListInvoicesParams) {
  return useQuery({
    queryKey: invoiceQK.list(params || {}),
    queryFn: () => InvoiceService.getInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceQK.detail(id),
    queryFn: () => InvoiceService.getInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InvoiceWritePayload) => InvoiceService.createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQK.all });
      toast.success("Invoice berhasil dibuat");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal membuat invoice");
    },
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InvoiceWritePayload) => InvoiceService.updateInvoice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQK.all });
      toast.success("Invoice berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah invoice");
    },
  });
}

export function useSetInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      InvoiceService.setInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQK.all });
      toast.success("Status invoice berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah status invoice");
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQK.all });
      toast.success("Invoice berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus invoice");
    },
  });
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: (invoice: Pick<PlatformInvoice, "id" | "number" | "invoice_date">) =>
      InvoiceService.downloadInvoicePdf(invoice),
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengunduh PDF");
    },
  });
}
