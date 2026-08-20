"use client";

import { useRouter } from "next/navigation";
import { useUpdateGeneralFacility } from "@/hooks/api/use-general-facility";
import { useGeneralFacility } from "@/hooks/api/use-general-facility";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

type Props = {
  id: string;
  active: boolean;
  disabled?: boolean;
};

export function GeneralFacilityStatusToggle({ id, active, disabled }: Props) {
  const router = useRouter();
  const { data: item } = useGeneralFacility(id);
  const updateMutation = useUpdateGeneralFacility(id);
  const pending = updateMutation.isPending;

  async function toggle() {
    if (disabled || pending || !item) return;
    const next = !active;
    try {
      await updateMutation.mutateAsync({
        name: item.name,
        is_active: next,
        is_auto_suspend: item.is_auto_suspend,
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengubah status general facility");
    }
  }

  return (
    <Switch
      checked={active}
      onChange={toggle}
      disabled={disabled || pending}
      aria-label={active ? "Deactivate general facility" : "Activate general facility"}
      title={
        active
          ? "Active — click to deactivate"
          : "Inactive — click to activate"
      }
    />
  );
}
