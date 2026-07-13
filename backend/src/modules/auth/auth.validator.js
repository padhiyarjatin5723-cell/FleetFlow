import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(150),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),

  phone: z
    .string()
    .min(10, "Phone number is required")
    .max(20),

  roleId: z
    .string()
    .uuid("Invalid Role ID"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const logoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export const logoutAllSchema = z.object({
  userId: z
    .string()
    .uuid("Invalid User ID"),
});