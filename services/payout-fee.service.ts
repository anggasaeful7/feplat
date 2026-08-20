import { api } from "@/lib/axios";
import type { PayoutFee, PayoutFeePayload } from "@/types";

export const PayoutFeeService = {
  getPayoutFee: async () => {
    return api<PayoutFee>("/payout-fee");
  },

  updatePayoutFee: async (payload: PayoutFeePayload) => {
    return api<PayoutFee>("/payout-fee", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
