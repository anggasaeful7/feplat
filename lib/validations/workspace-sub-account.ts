import { z } from "zod";

export const workspaceSubAccountSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 150 characters")
    .max(150, "Name must be between 2 and 150 characters"),
});

export type WorkspaceSubAccountInput = z.infer<typeof workspaceSubAccountSchema>;
