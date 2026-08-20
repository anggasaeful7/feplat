import { useQuery } from "@tanstack/react-query";
import { BankMerchantService } from "@/services/bank-merchant.service";

export const bankMerchantQK = {
  all: ["bank-merchants"] as const,
  lists: () => [...bankMerchantQK.all, "list"] as const,
  list: () => [...bankMerchantQK.lists()] as const,
};

export function useBankMerchants(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bankMerchantQK.list(),
    queryFn: () => BankMerchantService.getBankMerchants(),
    ...options,
  });
}
