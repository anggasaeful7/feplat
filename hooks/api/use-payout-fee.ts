import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PayoutFeeService } from "@/services/payout-fee.service";
import type { PayoutFeePayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const payoutFeeQK = {
  all: ["payout-fee"] as const,
};

export function usePayoutFee() {
  return useQuery({
    queryKey: payoutFeeQK.all,
    queryFn: () => PayoutFeeService.getPayoutFee(),
  });
}

export function useUpdatePayoutFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayoutFeePayload) => PayoutFeeService.updatePayoutFee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutFeeQK.all });
      toast.success("Payout fee berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal memperbarui payout fee");
    },
  });
}
