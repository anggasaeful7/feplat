import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BillComponentService, type ListBillComponentsParams } from "@/services/bill-component.service";
import type { BillComponentWritePayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const billComponentQK = {
  all: ["bill-components"] as const,
  lists: () => [...billComponentQK.all, "list"] as const,
  list: (params?: ListBillComponentsParams) => [...billComponentQK.lists(), params] as const,
  details: () => [...billComponentQK.all, "detail"] as const,
  detail: (id: string) => [...billComponentQK.details(), id] as const,
};

export function useBillComponents(params?: ListBillComponentsParams) {
  return useQuery({
    queryKey: billComponentQK.list(params || {}),
    queryFn: () => BillComponentService.getBillComponents(params),
  });
}

export function useBillComponent(id: string) {
  return useQuery({
    queryKey: billComponentQK.detail(id),
    queryFn: () => BillComponentService.getBillComponent(id),
    enabled: !!id,
  });
}

export function useCreateBillComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BillComponentWritePayload) => BillComponentService.createBillComponent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Bill component berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan bill component");
    },
  });
}

export function useUpdateBillComponent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BillComponentWritePayload) => BillComponentService.updateBillComponent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Bill component berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah bill component");
    },
  });
}

export function useDeleteBillComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BillComponentService.deleteBillComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Bill component berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus bill component");
    },
  });
}
