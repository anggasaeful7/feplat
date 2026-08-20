import { z } from "zod";

export const PAYMENT_METHODS = [
  "QRIS",
  "ALFAMART",
  "INDOMARET",
  "VA_BCA",
  "VA_BRI",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const paymentFeeSchema = z.object({
  payment_method: z.enum(PAYMENT_METHODS, {
    message: "Pilih metode pembayaran",
  }),
  payment_per_month: z
    .number({ message: "Payment per month harus angka" })
    .nonnegative("Payment per month harus 0 atau lebih"),
  maximum_payment: z
    .number({ message: "Maximum payment harus angka" })
    .nonnegative("Maximum payment harus 0 atau lebih"),
  maximum_month: z
    .number({ message: "Maximum month harus angka" })
    .int("Maximum month harus bilangan bulat")
    .min(1, "Maximum month minimal 1"),
  is_flat: z.boolean(),
  flat_value: z
    .number({ message: "Flat value harus angka" })
    .nonnegative("Flat value harus 0 atau lebih"),
});

export type PaymentFeeInput = z.infer<typeof paymentFeeSchema>;
