import { api } from "@/lib/axios";
import type {
  Property,
  PropertyListResponse,
  PropertyLocationPayload,
  SubjectType,
} from "@/types";

export type ListPropertiesParams = {
  q?: string;
  type?: string;
  limit?: number;
  offset?: number;
};

/**
 * Semua endpoint dikunci {subject_type}/{subject_id}, bukan property id: subjek
 * peta adalah tenant kalau workspace-nya bernaung di bawah tenant, kalau tidak
 * ya workspace itu sendiri — dan sebelum lokasinya pertama kali disimpan baris
 * propertinya belum ada sehingga property id belum bisa menunjuk apa pun.
 */
function subjectPath(type: SubjectType, id: string) {
  return `/properties/${encodeURIComponent(type)}/${encodeURIComponent(id)}`;
}

export const PropertyService = {
  getProperties: async (params?: ListPropertiesParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.q) searchParams.append("q", params.q);
      if (params.type) searchParams.append("type", params.type);
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
    }
    const query = searchParams.toString();
    return api<PropertyListResponse>(`/properties${query ? `?${query}` : ""}`);
  },

  getProperty: async (type: SubjectType, id: string) => {
    return api<Property>(subjectPath(type, id));
  },

  setLocation: async (
    type: SubjectType,
    id: string,
    payload: PropertyLocationPayload,
  ) => {
    return api<Property>(`${subjectPath(type, id)}/location`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  clearLocation: async (type: SubjectType, id: string) => {
    return api<Property>(`${subjectPath(type, id)}/location`, {
      method: "DELETE",
    });
  },
};
