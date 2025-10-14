// lib/formValidationSchemas.ts - ONLY SCHEMAS, NO ACTIONS
import { z } from 'zod';

export const gradeSchema = z.object({
  id: z.string().optional(),
  level: z.string()
    .min(1, "Grade level is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Grade level must be a positive number"
    ),
  description: z.string().optional(),
});

export type GradeSchema = z.infer<typeof gradeSchema>;

// REMOVE ALL SERVER ACTIONS FROM THIS FILE
// They should only be in lib/actions.ts