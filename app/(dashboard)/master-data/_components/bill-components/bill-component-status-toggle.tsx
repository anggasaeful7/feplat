"use client";

import { useRouter } from "next/navigation";
import { useUpdateBillComponent } from "@/hooks/api/use-bill-component";
import { useBillComponent } from "@/hooks/api/use-bill-component";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

type Props = {
  id: string;
  active: boolean;
  disabled?: boolean;
};

export function BillComponentStatusToggle({ id, active, disabled }: Props) {
  const router = useRouter();
  const { data: item } = useBillComponent(id);
  const updateMutation = useUpdateBillComponent(id);
  const pending = updateMutation.isPending;

  async function toggle() {
    if (disabled || pending || !item) return;
    const next = !active;
    try {
      await updateMutation.mutateAsync({
        name: item.name,
        description: item.description,
        amount: item.amount,
        is_variable: item.is_variable,
        is_active: next,
        sort_order: item.sort_order,
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengubah status bill component");
    }
  }

  return (
    <Switch
      checked={active}
      onChange={toggle}
      disabled={disabled || pending}
      aria-label={active ? "Deactivate bill component" : "Activate bill component"}
      title={
        active
          ? "Active — click to deactivate"
          : "Inactive — click to activate"
      }
    />
  );
}
