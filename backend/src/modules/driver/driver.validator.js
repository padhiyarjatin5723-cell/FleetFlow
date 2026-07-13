import { z } from "zod";

export const createDriverSchema = z.object({
  employeeCode: z
    .string()
    .min(3)
    .max(20),

  fullName: z
    .string()
    .min(3)
    .max(150),

  email: z
    .string()
    .email()
    .toLowerCase(),

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
    .number()
    .int()
    .min(0),

  status: z.enum([
    "AVAILABLE",
    "ON_TRIP",
    "ON_LEAVE",
    "SUSPENDED",
  ]),

  joiningDate: z.coerce.date().optional(),

  address: z.string().optional(),

  emergencyContact: z
    .string()
    .max(20)
    .optional(),
});

export const updateDriverSchema =
  createDriverSchema.partial();