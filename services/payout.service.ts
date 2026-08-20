import { api } from "@/lib/axios";
import type { PayoutLogListResponse, PayoutLog, CreatePayoutPayload } from "@/types";

export type ListPayoutLogsParams = {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export const PayoutService = {
  getPayoutLogs: async (params?: ListPayoutLogsParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.status) searchParams.append("status", params.status);
      if (params.date_from) searchParams.append("date_from", params.date_from);
      if (params.date_to) searchParams.append("date_to", params.date_to);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.per_page !== undefined) searchParams.append("per_page", String(params.per_page));
    }
    const query = searchParams.toString();
    const path = `/payout-logs${query ? `?${query}` : ""}`;
    return api<PayoutLogListResponse>(path);
  },

  createPayout: async (workspaceId: string, payload: CreatePayoutPayload) => {
    return api<PayoutLog>(`/workspaces/${encodeURIComponent(workspaceId)}/payouts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
