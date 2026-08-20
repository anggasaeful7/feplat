"use client";

import { useSetTenantActive } from "@/hooks/api/use-tenant";
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
  const activeMutation = useSetTenantActive();
  const pending = activeMutation.isPending;

  async function toggle() {
    if (disabled || pending) return;
    const next = !active;
    try {
      await activeMutation.mutateAsync({ id, isActive: next });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengubah status tenant");
    }
  }

  return (
    <Switch
      checked={active}
      onChange={toggle}
      disabled={disabled || pending}
      aria-label={active ? "Deactivate tenant" : "Activate tenant"}
      title={
        active
          ? "Active — click to deactivate"
          : "Inactive — click to activate"
      }
    />
  );
}
