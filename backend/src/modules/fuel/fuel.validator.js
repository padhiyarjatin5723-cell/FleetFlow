import { z } from "zod";

export const createFuelSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.string().uuid().optional(),
  fuelDate: z.coerce.date(),
  quantity: z.number().positive(),
  pricePerLiter: z.number().positive(),
  totalAmount: z.number().positive(),
  odometerKm: z.number().positive(),
  stationName: z.string().max(150).optional(),
});

export const updateFuelSchema = createFuelSchema.partial();