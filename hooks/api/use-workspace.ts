import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService, type ListWorkspacesParams } from "@/services/workspace.service";
import type { WorkspaceWritePayload, PaymentFeePayload, WorkspaceDeployment, WorkspaceBalance } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const workspaceQK = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceQK.all, "list"] as const,
  list: (params?: ListWorkspacesParams) => [...workspaceQK.lists(), params] as const,
  details: () => [...workspaceQK.all, "detail"] as const,
  detail: (id: string) => [...workspaceQK.details(), id] as const,
};

export function useWorkspaces(params?: ListWorkspacesParams) {
  return useQuery({
    queryKey: workspaceQK.list(params || {}),
    queryFn: () => WorkspaceService.getWorkspaces(params),
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: workspaceQK.detail(id),
    queryFn: () => WorkspaceService.getWorkspace(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceWritePayload) => WorkspaceService.createWorkspace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.all });
      toast.success("Workspace berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan workspace");
    },
  });
}

export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceWritePayload) => WorkspaceService.updateWorkspace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.all });
      toast.success("Workspace berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah workspace");
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => WorkspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.all });
      toast.success("Workspace berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus workspace");
    },
  });
}

export const paymentFeeQK = {
  all: (workspaceId: string) => [...workspaceQK.detail(workspaceId), "payment-fees"] as const,
};

export function useWorkspacePaymentFees(workspaceId: string) {
  return useQuery({
    queryKey: paymentFeeQK.all(workspaceId),
    queryFn: () => WorkspaceService.listPaymentFees(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspacePaymentFee(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentFeePayload) =>
      WorkspaceService.createPaymentFee(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentFeeQK.all(workspaceId) });
      toast.success("Payment fee berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan payment fee");
    },
  });
}

export function useUpdateWorkspacePaymentFee(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentMethod, ...payload }: { paymentMethod: string } & PaymentFeePayload) =>
      WorkspaceService.updatePaymentFee(workspaceId, paymentMethod, { ...payload, payment_method: paymentMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentFeeQK.all(workspaceId) });
      toast.success("Payment fee berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah payment fee");
    },
  });
}

export function useDeleteWorkspacePaymentFee(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: string) =>
      WorkspaceService.deletePaymentFee(workspaceId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentFeeQK.all(workspaceId) });
      toast.success("Payment fee berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus payment fee");
    },
  });
}

export function useUpdateWorkspaceDokuSubAccount(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { email: string; type: "STANDARD"; name: string }) =>
      WorkspaceService.updateDokuSubAccount(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.detail(workspaceId) });
      toast.success("Doku Sub-Account berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal memperbarui Doku Sub-Account");
    },
  });
}

export function useUpdateWorkspacePayoutBank(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { bank_merchant_id: string; bank_account_number: string; bank_account_name: string }) =>
      WorkspaceService.updatePayoutBank(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.detail(workspaceId) });
      toast.success("Payout Bank berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal memperbarui Payout Bank");
    },
  });
}

export function useUpdateWorkspaceDeployment(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceDeployment) =>
      WorkspaceService.updateDeployment(workspaceId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceQK.detail(workspaceId) });
      // Saved, but the operator service did not accept it — say so instead of
      // reporting a clean success the operator side cannot back up.
      if (data?.synced === false) {
        toast.warning("Deployment tersimpan, tapi sinkronisasi ke operator gagal");
        return;
      }
      toast.success("Deployment berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal memperbarui Deployment");
    },
  });
}

export function useWorkspaceBalance(workspaceId: string) {
  return useQuery({
    queryKey: [...workspaceQK.detail(workspaceId), "balance"] as const,
    queryFn: () => WorkspaceService.getWorkspaceBalance(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspacePayoutBank(workspaceId: string) {
  return useQuery({
    queryKey: [...workspaceQK.detail(workspaceId), "payout-bank"] as const,
    queryFn: () => WorkspaceService.getWorkspacePayoutBank(workspaceId),
    enabled: !!workspaceId,
  });
}
