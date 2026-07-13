import { z } from "zod";

export const createVehicleSchema = z.object({
  registrationNo: z
    .string()
    .min(5)
    .max(20),

  vehicleType: z
    .string()
    .min(2)
    .max(50),

  make: z
    .string()
    .min(2)
    .max(100),

  model: z
    .string()
    .min(1)
    .max(100),

  year: z
    .number()
    .int(),

  capacityKg: z
    .number()
    .positive(),

  fuelType: z.enum([
    "PETROL",
    "DIESEL",
    "CNG",
    "EV",
  ]),

  purchaseDate: z.coerce.date(),
});

export const updateVehicleSchema =
  createVehicleSchema.partial();