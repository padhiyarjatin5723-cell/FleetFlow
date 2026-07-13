import { z } from "zod";

export const createAuditLogSchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
    action: z.string().min(3).max(150),
    entityType: z.string().min(2).max(100),
    entityId: z.string().uuid().optional(),
    oldData: z.any().optional(),
    newData: z.any().optional(),
  }),
});

export const updateAuditLogSchema = z.object({
  body: z.object({
    action: z.string().min(3).max(150).optional(),
    entityType: z.string().min(2).max(100).optional(),
    entityId: z.string().uuid().optional(),
    oldData: z.any().optional(),
    newData: z.any().optional(),
  }),
});