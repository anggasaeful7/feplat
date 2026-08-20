import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantService, type ListTenantsParams } from "@/services/tenant.service";
import type { TenantWritePayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const tenantQK = {
  all: ["tenants"] as const,
  lists: () => [...tenantQK.all, "list"] as const,
  list: (params?: ListTenantsParams) => [...tenantQK.lists(), params] as const,
  details: () => [...tenantQK.all, "detail"] as const,
  detail: (id: string) => [...tenantQK.details(), id] as const,
};

export function useTenants(params?: ListTenantsParams) {
  return useQuery({
    queryKey: tenantQK.list(params || {}),
    queryFn: () => TenantService.getTenants(params),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantQK.detail(id),
    queryFn: () => TenantService.getTenant(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TenantWritePayload) => TenantService.createTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQK.all });
      toast.success("Tenant berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan tenant");
    },
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<TenantWritePayload> & { is_active?: boolean }) =>
      TenantService.updateTenant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQK.all });
      toast.success("Tenant berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah tenant");
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TenantService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQK.all });
      toast.success("Tenant berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus tenant");
    },
  });
}

export function useSetTenantActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      TenantService.setTenantActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQK.all });
      toast.success("Status tenant berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah status tenant");
    },
  });
}
