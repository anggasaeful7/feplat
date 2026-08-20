import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PayoutService, type ListPayoutLogsParams } from "@/services/payout.service";
import type { CreatePayoutPayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const payoutQK = {
  all: ["payouts"] as const,
  lists: () => [...payoutQK.all, "list"] as const,
  list: (params?: ListPayoutLogsParams) => [...payoutQK.lists(), params] as const,
};

export function usePayoutLogs(params?: ListPayoutLogsParams) {
  return useQuery({
    queryKey: payoutQK.list(params || {}),
    queryFn: () => PayoutService.getPayoutLogs(params),
  });
}

export function useCreatePayout(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayoutPayload) =>
      PayoutService.createPayout(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutQK.all });
      toast.success("Payout berhasil dibuat");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal membuat payout");
    },
  });
}
