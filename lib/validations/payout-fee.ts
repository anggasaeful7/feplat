import { z } from "zod";

export const payoutFeeSchema = z.object({
  value: z
    .number({ message: "Value must be a number" })
    .nonnegative("Value must be 0 or greater"),
});

export type PayoutFeeInput = z.infer<typeof payoutFeeSchema>;
