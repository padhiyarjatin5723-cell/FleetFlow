import { z } from "zod";

export const createExpenseSchema = z.object({
  tripId: z.string().uuid(),
  expenseType: z.enum([
    "TOLL",
    "FOOD",
    "PARKING",
    "REPAIR",
    "OTHER",
  ]),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  expenseDate: z.coerce.date(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
