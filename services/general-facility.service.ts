import { api } from "@/lib/axios";
import type { GeneralFacility, GeneralFacilityListResponse, GeneralFacilityWritePayload } from "@/types";

export type ListGeneralFacilitiesParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export const GeneralFacilityService = {
  getGeneralFacilities: async (params?: ListGeneralFacilitiesParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.search) searchParams.append("search", params.search);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    const path = `/admin/global/general-facilities${query ? `?${query}` : ""}`;
    return api<GeneralFacilityListResponse>(path);
  },

  getGeneralFacility: async (id: string) => {
    return api<GeneralFacility>(`/admin/global/general-facilities/${encodeURIComponent(id)}`);
  },

  createGeneralFacility: async (payload: GeneralFacilityWritePayload) => {
    return api<GeneralFacility>("/admin/global/general-facilities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateGeneralFacility: async (id: string, payload: GeneralFacilityWritePayload) => {
    return api<GeneralFacility>(`/admin/global/general-facilities/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteGeneralFacility: async (id: string) => {
    return api(`/admin/global/general-facilities/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
