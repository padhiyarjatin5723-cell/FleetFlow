import { z } from "zod";

const emptyToNull = (value) => value === "" || value === undefined ? null : value;

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
    .coerce.number()
    .int(),

  capacityKg: z
    .coerce.number()
    .positive(),

  fuelType: z.enum([
    "PETROL",
    "DIESEL",
    "CNG",
    "EV",
  ]),

  purchaseDate: z.coerce.date(),

  vin: z.preprocess(
    emptyToNull,
    z.string().max(100).optional().nullable()
  ),

  status: z
    .enum(["AVAILABLE", "ON_TRIP", "IN_MAINTENANCE", "OUT_OF_SERVICE"])
    .optional(),

  acquisitionCost: z
    .coerce.number()
    .positive()
    .optional()
    .nullable(),

  currentOdometer: z
    .coerce.number()
    .nonnegative()
    .optional()
    .nullable(),

  notes: z
    .string()
    .optional()
    .nullable(),
});

export const updateVehicleSchema =
  createVehicleSchema.partial();
