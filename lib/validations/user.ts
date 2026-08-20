import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .regex(EMAIL_RE, "Enter a valid email address.")
      .max(255, "Email must be 255 characters or fewer."),
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be between 2 and 150 characters.")
      .max(150, "Full name must be between 2 and 150 characters."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    role: z.enum(["superadmin", "owner_workspace", "admin_workspace"], {
      message: "Choose a valid role.",
    }),
    workspace_id: z.string().trim().optional().or(z.literal("")),
    tenant_id: z.string().trim().optional().or(z.literal("")),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.role !== "admin_workspace" || !!data.workspace_id, {
    message: "A workspace is required for this role.",
    path: ["workspace_id"],
  })
  .refine((data) => data.role !== "owner_workspace" || !!data.tenant_id, {
    message: "A tenant is required for this role.",
    path: ["tenant_id"],
  });

export const updateUserSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be between 2 and 150 characters.")
      .max(150, "Full name must be between 2 and 150 characters."),
    role: z.enum(["superadmin", "owner_workspace", "admin_workspace"], {
      message: "Choose a valid role.",
    }),
    workspace_id: z.string().trim().optional().or(z.literal("")),
    tenant_id: z.string().trim().optional().or(z.literal("")),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.role !== "admin_workspace" || !!data.workspace_id, {
    message: "A workspace is required for this role.",
    path: ["workspace_id"],
  })
  .refine((data) => data.role !== "owner_workspace" || !!data.tenant_id, {
    message: "A tenant is required for this role.",
    path: ["tenant_id"],
  });

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be 128 characters or fewer."),
    confPassword: z.string(),
  })
  .refine((data) => data.password === data.confPassword, {
    message: "Passwords do not match.",
    path: ["confPassword"],
  });

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be between 2 and 150 characters.")
    .max(150, "Full name must be between 2 and 150 characters."),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
