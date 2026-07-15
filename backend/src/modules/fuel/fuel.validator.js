import { z } from "zod";

const emptyToUndefined = (value) => value === "" || value === null ? undefined : value;

export const createFuelSchema = z.object({
  vehicleId: z.string().uuid(),
  tripId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  fuelDate: z.coerce.date(),
  quantity: z.coerce.number().positive(),
  pricePerLiter: z.coerce.number().positive(),
  totalAmount: z.coerce.number().positive().optional(),
  odometerKm: z.coerce.number().positive(),
  stationName: z.preprocess(emptyToUndefined, z.string().max(150).optional()),
});

export const updateFuelSchema = createFuelSchema.partial();
