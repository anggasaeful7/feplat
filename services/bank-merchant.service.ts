import { api } from "@/lib/axios";
import type { BankMerchantListResponse } from "@/types";

export const BankMerchantService = {
  getBankMerchants: async () => {
    return api<BankMerchantListResponse>("/bank-merchants");
  },
};
