import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";
import {
  PropertyService,
  type ListPropertiesParams,
} from "@/services/property.service";
import type { PropertyLocationPayload, SubjectType } from "@/types";

export const propertyQK = {
  all: ["properties"] as const,
  lists: () => [...propertyQK.all, "list"] as const,
  list: (params?: ListPropertiesParams) =>
    [...propertyQK.lists(), params] as const,
  details: () => [...propertyQK.all, "detail"] as const,
  detail: (type: SubjectType, id: string) =>
    [...propertyQK.details(), type, id] as const,
};

export function useProperties(params?: ListPropertiesParams) {
  return useQuery({
    queryKey: propertyQK.list(params || {}),
    queryFn: () => PropertyService.getProperties(params),
  });
}

export function useProperty(type: SubjectType, id: string) {
  return useQuery({
    queryKey: propertyQK.detail(type, id),
    queryFn: () => PropertyService.getProperty(type, id),
    enabled: !!id,
  });
}

type SetLocationVars = {
  subjectType: SubjectType;
  subjectId: string;
} & PropertyLocationPayload;

export function useSetPropertyLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectType, subjectId, ...payload }: SetLocationVars) =>
      PropertyService.setLocation(subjectType, subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyQK.all });
      toast.success("Lokasi berhasil disimpan");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Gagal menyimpan lokasi",
      );
    },
  });
}

export function useClearPropertyLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: SubjectType; id: string }) =>
      PropertyService.clearLocation(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyQK.all });
      toast.success("Lokasi dihapus");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Gagal menghapus lokasi",
      );
    },
  });
}
