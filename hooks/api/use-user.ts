import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService, type ListUsersParams } from "@/services/user.service";
import type { CreateUserPayload, UpdateUserPayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const userQK = {
  all: ["users"] as const,
  lists: () => [...userQK.all, "list"] as const,
  list: (params?: ListUsersParams) => [...userQK.lists(), params] as const,
  details: () => [...userQK.all, "detail"] as const,
  detail: (id: string) => [...userQK.details(), id] as const,
};

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userQK.list(params || {}),
    queryFn: () => UserService.getUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userQK.detail(id),
    queryFn: () => UserService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => UserService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQK.all });
      toast.success("User berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan user");
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => UserService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQK.all });
      toast.success("User berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQK.all });
      toast.success("User berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus user");
    },
  });
}

export function useChangePassword(id: string) {
  return useMutation({
    mutationFn: (payload: { password: string; confPassword: string }) => UserService.changePassword(id, payload),
    onSuccess: () => {
      toast.success("Password berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah password");
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => UserService.setUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQK.all });
      toast.success("Status user berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah status user");
    },
  });
}
