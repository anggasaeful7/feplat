import type { Role } from "@/types";
import { ROLE_LABEL } from "@/types/user";

const styles: Record<Role, string> = {
  superadmin: "bg-brand-soft text-brand ring-brand/20",
  owner_workspace: "bg-[#fef3c7] text-[#92400e] ring-[#92400e]/15",
  admin_workspace: "bg-[#dbeafe] text-[#1d4ed8] ring-[#1d4ed8]/15",
};

const dots: Record<Role, string> = {
  superadmin: "bg-brand",
  owner_workspace: "bg-[#92400e]",
  admin_workspace: "bg-[#1d4ed8]",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${styles[role]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[role]}`} aria-hidden />
      {ROLE_LABEL[role]}
    </span>
  );
}
