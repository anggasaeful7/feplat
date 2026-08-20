import { z } from "zod";
import { SLUG_PATTERN } from "@/types/workspace";

export const workspaceSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be between 2 and 150 characters.")
    .max(150, "Display name must be between 2 and 150 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be between 2 and 80 characters.")
    .max(80, "Slug must be between 2 and 80 characters.")
    .regex(SLUG_PATTERN, "Slug may only contain lowercase letters, numbers, and single hyphens."),
  logo: z
    .string()
    .trim()
    .max(1024, "Logo URL must be 1024 characters or fewer.")
    .optional()
    .or(z.literal("")),
  tipe_workspace: z.enum(["residence", "apartement", "kost"], {
    message: "Choose a valid workspace type.",
  }),
  expired_at: z
    .string()
    .trim()
    .refine((val) => !val || !Number.isNaN(new Date(val).getTime()), "Expiration date is invalid.")
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      d.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Expiration date must be today or later.")
    .optional()
    .or(z.literal("")),
  tenant_id: z.string().optional().or(z.literal("")),
  code: z.string().trim().optional().or(z.literal("")),
  admin_name: z.string().trim().optional().or(z.literal("")),
  admin_email: z.string().trim().optional().or(z.literal("")),
  bank_merchant_id: z.string().trim().optional().or(z.literal("")),
  bank_account_number: z.string().trim().optional().or(z.literal("")),
  bank_account_name: z.string().trim().optional().or(z.literal("")),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
