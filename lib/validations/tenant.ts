import { z } from "zod";
import { SLUG_PATTERN } from "@/types/tenant";

export const tenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 150 characters.")
    .max(150, "Name must be between 2 and 150 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be between 2 and 80 characters.")
    .max(80, "Slug must be between 2 and 80 characters.")
    .regex(SLUG_PATTERN, "Slug may only contain lowercase letters, numbers, and single hyphens."),
  owner_name: z
    .string()
    .trim()
    .min(2, "Owner name must be between 2 and 150 characters.")
    .max(150, "Owner name must be between 2 and 150 characters."),
  owner_email: z
    .string()
    .trim()
    .email("Owner email must be a valid email address.")
    .max(150, "Owner email must be 150 characters or fewer."),
  is_active: z.boolean().optional(),
});

export const editTenantSchema = tenantSchema.omit({
  owner_name: true,
  owner_email: true,
});

export type TenantInput = z.infer<typeof tenantSchema>;
export type EditTenantInput = z.infer<typeof editTenantSchema>;
