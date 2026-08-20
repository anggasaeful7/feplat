import { z } from "zod";

export const generalFacilitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 150 characters.")
    .max(150, "Name must be between 2 and 150 characters."),
  is_active: z.boolean(),
  is_auto_suspend: z.boolean(),
});

export type GeneralFacilityInput = z.infer<typeof generalFacilitySchema>;
