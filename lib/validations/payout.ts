import { z } from "zod";

export const createPayoutSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(1, "Amount must be greater than 0"),
  reason: z.string().trim().min(1, "Reason is required").max(500, "Reason must be 500 characters or fewer"),
});

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
