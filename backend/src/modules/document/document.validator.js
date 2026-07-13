import { z } from "zod";

export const createDocumentSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid().optional(),
    driverId: z.string().uuid().optional(),

    documentType: z.enum([
      "RC",
      "INSURANCE",
      "PUC",
      "LICENSE",
      "INVOICE",
      "DELIVERY_CHALLAN",
      "OTHER",
    ]),

    title: z.string().min(2),

    fileUrl: z.string().min(1),

    expiryDate: z.string().datetime().optional(),
  }),
});

export const updateDocumentSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid().optional(),
    driverId: z.string().uuid().optional(),

    documentType: z.enum([
      "RC",
      "INSURANCE",
      "PUC",
      "LICENSE",
      "INVOICE",
      "DELIVERY_CHALLAN",
      "OTHER",
    ]).optional(),

    title: z.string().optional(),

    fileUrl: z.string().optional(),

    expiryDate: z.string().datetime().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});