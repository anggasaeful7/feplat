import { z } from "zod";

export const workspacePayoutBankSchema = z.object({
  bank_merchant_id: z.string().min(1, "Please select a bank"),
  bank_account_number: z
    .string()
    .trim()
    .min(5, "Account number must be at least 5 digits")
    .max(30, "Account number must be 30 digits or fewer"),
  bank_account_name: z
    .string()
    .trim()
    .min(2, "Account name must be between 2 and 150 characters")
    .max(150, "Account name must be between 2 and 150 characters"),
});

export type WorkspacePayoutBankInput = z.infer<typeof workspacePayoutBankSchema>;
