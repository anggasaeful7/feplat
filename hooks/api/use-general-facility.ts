import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GeneralFacilityService, type ListGeneralFacilitiesParams } from "@/services/general-facility.service";
import type { GeneralFacilityWritePayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const generalFacilityQK = {
  all: ["general-facilities"] as const,
  lists: () => [...generalFacilityQK.all, "list"] as const,
  list: (params?: ListGeneralFacilitiesParams) => [...generalFacilityQK.lists(), params] as const,
  details: () => [...generalFacilityQK.all, "detail"] as const,
  detail: (id: string) => [...generalFacilityQK.details(), id] as const,
};

export function useGeneralFacilities(params?: ListGeneralFacilitiesParams) {
  return useQuery({
    queryKey: generalFacilityQK.list(params || {}),
    queryFn: () => GeneralFacilityService.getGeneralFacilities(params),
  });
}

export function useGeneralFacility(id: string) {
  return useQuery({
    queryKey: generalFacilityQK.detail(id),
    queryFn: () => GeneralFacilityService.getGeneralFacility(id),
    enabled: !!id,
  });
}

export function useCreateGeneralFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneralFacilityWritePayload) => GeneralFacilityService.createGeneralFacility(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generalFacilityQK.all });
      toast.success("General facility berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan general facility");
    },
  });
}

export function useUpdateGeneralFacility(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneralFacilityWritePayload) => GeneralFacilityService.updateGeneralFacility(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generalFacilityQK.all });
      toast.success("General facility berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah general facility");
    },
  });
}

export function useDeleteGeneralFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => GeneralFacilityService.deleteGeneralFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generalFacilityQK.all });
      toast.success("General facility berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus general facility");
    },
  });
}
