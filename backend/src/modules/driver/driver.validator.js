import { z } from "zod";

const emptyToUndefined = (value) => value === "" || value === null ? undefined : value;

export const createDriverSchema = z.object({
  employeeCode: z
    .string()
    .min(3)
    .max(20),

  fullName: z
    .string()
    .min(3)
    .max(150),

  email: z.preprocess(
    emptyToUndefined,
    z.string().email().toLowerCase().optional()
  ),

  phone: z
    .string()
    .min(10)
    .max(20),

  licenseNumber: z
    .string()
    .min(5)
    .max(100),

  licenseExpiry: z.coerce.date(),

  experienceYears: z
    .coerce.number()
    .int()
    .min(0),

  status: z.enum([
    "AVAILABLE",
    "ON_TRIP",
    "ON_LEAVE",
    "SUSPENDED",
  ]),

  joiningDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),

  address: z.preprocess(emptyToUndefined, z.string().optional()),

  emergencyContact: z.preprocess(
    emptyToUndefined,
    z.string().max(20).optional()
  ),
});

export const updateDriverSchema =
  createDriverSchema.partial();
