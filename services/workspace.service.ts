import { api } from "@/lib/axios";
import type {
  Workspace,
  WorkspaceCreateResponse,
  WorkspaceListResponse,
  WorkspaceWritePayload,
  PaymentFee,
  PaymentFeePayload,
  PaymentFeeListResponse,
  WorkspaceDetailResponse,
  WorkspaceDeployment,
  WorkspaceDeploymentResult,
  WorkspaceBalance,
  PayoutBank,
} from "@/types";

export type ListWorkspacesParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export const WorkspaceService = {
  getWorkspaces: async (params?: ListWorkspacesParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    const path = `/workspaces${query ? `?${query}` : ""}`;
    return api<WorkspaceListResponse>(path);
  },

  getWorkspace: async (id: string) => {
    return api<WorkspaceDetailResponse>(`/workspaces/${encodeURIComponent(id)}`);
  },

  createWorkspace: async (payload: WorkspaceWritePayload) => {
    return api<WorkspaceCreateResponse>("/workspaces", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateWorkspace: async (id: string, payload: WorkspaceWritePayload) => {
    return api<Workspace>(`/workspaces/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteWorkspace: async (id: string) => {
    return api(`/workspaces/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  listPaymentFees: async (workspaceId: string) => {
    return api<PaymentFeeListResponse>(`/workspaces/${encodeURIComponent(workspaceId)}/payment-fees`);
  },

  createPaymentFee: async (workspaceId: string, payload: PaymentFeePayload) => {
    return api<PaymentFee>(`/workspaces/${encodeURIComponent(workspaceId)}/payment-fees`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePaymentFee: async (workspaceId: string, paymentMethod: string, payload: PaymentFeePayload) => {
    return api<PaymentFee>(
      `/workspaces/${encodeURIComponent(workspaceId)}/payment-fees/${encodeURIComponent(paymentMethod)}`,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  deletePaymentFee: async (workspaceId: string, paymentMethod: string) => {
    return api(
      `/workspaces/${encodeURIComponent(workspaceId)}/payment-fees/${encodeURIComponent(paymentMethod)}`,
      { method: "DELETE" },
    );
  },

  updateDokuSubAccount: async (workspaceId: string, payload: { email: string; type: "STANDARD"; name: string }) => {
    return api(`/workspaces/${encodeURIComponent(workspaceId)}/doku-sub-account`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePayoutBank: async (workspaceId: string, payload: { bank_merchant_id: string; bank_account_number: string; bank_account_name: string }) => {
    return api(`/workspaces/${encodeURIComponent(workspaceId)}/payout-bank`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateDeployment: async (workspaceId: string, payload: WorkspaceDeployment) => {
    return api<WorkspaceDeploymentResult>(`/workspaces/${encodeURIComponent(workspaceId)}/deployment`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getWorkspaceBalance: async (workspaceId: string) => {
    return api<WorkspaceBalance>(`/workspaces/${encodeURIComponent(workspaceId)}/balance`);
  },

  getWorkspacePayoutBank: async (workspaceId: string) => {
    return api<PayoutBank>(`/workspaces/${encodeURIComponent(workspaceId)}/payout-bank`);
  },
};

