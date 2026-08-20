"use client";

import { useSetUserActive } from "@/hooks/api/use-user";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

type Props = {
  id: string;
  active: boolean;
  disabled?: boolean;
};

export function StatusToggle({ id, active, disabled }: Props) {
  const router = useRouter();
  const activeMutation = useSetUserActive();
  const pending = activeMutation.isPending;

  async function toggle() {
    if (disabled || pending) return;
    const next = !active;
    try {
      await activeMutation.mutateAsync({ id, isActive: next });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengubah status user");
    }
  }

  return (
    <Switch
      checked={active}
      onChange={toggle}
      disabled={disabled || pending}
      aria-label={active ? "Deactivate user" : "Activate user"}
      title={
        disabled
          ? "You cannot change your own status"
          : active
            ? "Active — click to deactivate"
            : "Inactive — click to activate"
      }
    />
  );
}
