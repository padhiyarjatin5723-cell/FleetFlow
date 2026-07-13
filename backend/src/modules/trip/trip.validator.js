import { z } from "zod";

export const createTripSchema = z.object({
  tripNumber: z.string().min(3).max(50),

  vehicleId: z.string().uuid(),

  driverId: z.string().uuid(),

  source: z.string().min(2).max(150),

  destination: z.string().min(2).max(150),

  cargoDescription: z.string().min(2).max(500).optional(),

  cargoWeightKg: z.number().positive(),

  distanceKm: z.number().positive(),

  scheduledStart: z.coerce.date(),

  scheduledEnd: z.coerce.date().optional(),

  actualStart: z.coerce.date().optional(),

  actualEnd: z.coerce.date().optional(),

  status: z.enum([
    "PLANNED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),

  remarks: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial();