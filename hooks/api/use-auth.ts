import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

export const authQK = {
  all: ["auth"] as const,
  me: () => [...authQK.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authQK.me(),
    queryFn: () => AuthService.getCurrentUser(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => AuthService.login(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQK.all });
    },
  });
}
