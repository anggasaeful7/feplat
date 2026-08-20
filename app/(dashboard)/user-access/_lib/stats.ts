import type { Role, User } from "@/types";
import { ROLES } from "@/types/user";

export function computeStats(users: User[], total: number) {
  const active = users.filter((u) => u.is_active).length;
  const byRole = ROLES.reduce<Record<Role, number>>(
    (acc, r) => {
      acc[r] = users.filter((u) => u.role === r).length;
      return acc;
    },
    { superadmin: 0, owner_workspace: 0, admin_workspace: 0 }
  );

  return {
    total,
    active,
    activePct: users.length ? Math.round((active / users.length) * 100) : 0,
    byRole,
  };
}
