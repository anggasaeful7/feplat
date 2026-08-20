import { api } from "@/lib/axios";
import type { BillComponent, BillComponentListResponse, BillComponentWritePayload } from "@/types";

export type ListBillComponentsParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export const BillComponentService = {
  getBillComponents: async (params?: ListBillComponentsParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    const path = `/admin/global/bill-components${query ? `?${query}` : ""}`;
    return api<BillComponentListResponse>(path);
  },

  getBillComponent: async (id: string) => {
    return api<BillComponent>(`/admin/global/bill-components/${encodeURIComponent(id)}`);
  },

  createBillComponent: async (payload: BillComponentWritePayload) => {
    return api<BillComponent>("/admin/global/bill-components", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBillComponent: async (id: string, payload: BillComponentWritePayload) => {
    return api<BillComponent>(`/admin/global/bill-components/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteBillComponent: async (id: string) => {
    return api(`/admin/global/bill-components/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
