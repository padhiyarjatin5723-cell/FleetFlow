import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().optional(),
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  serviceDate: z.coerce.date(),
  nextServiceDate: z.coerce.date().optional(),
  odometerKm: z.number().optional(),
  cost: z.number().nonnegative(),
  vendor: z.string().optional(),
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const completeMaintenanceSchema = z.object({
  nextServiceDate: z.coerce.date().optional(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
