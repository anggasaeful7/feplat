import { z } from "zod";

export const billComponentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 150 characters.")
    .max(150, "Name must be between 2 and 150 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  amount: z
    .number({ message: "Amount must be a number." })
    .min(0, "Amount must be 0 or greater."),
  is_variable: z.boolean(),
  is_active: z.boolean(),
  sort_order: z
    .number({ message: "Sort order must be a number." })
    .int("Sort order must be a whole number.")
    .min(0, "Sort order must be 0 or greater."),
});

export type BillComponentInput = z.infer<typeof billComponentSchema>;
