import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    title: z.string().min(3).max(150),
    message: z.string().min(3),
    type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]),
    isRead: z.boolean().optional(),
  }),
});

export const updateNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    message: z.string().min(3).optional(),
    type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).optional(),
    isRead: z.boolean().optional(),
  }),
});