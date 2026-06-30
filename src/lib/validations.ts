import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  states: z.string().min(1, "At least one state must be provided"),
  csvId: z.string().optional().nullable(),
});

export const toggleStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["ADMIN"]),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const deleteUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["PENDING", "ASSIGNED", "DELIVERED", "CANCELLED", "REJECTED"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  profileImage: z.string().url().or(z.string().startsWith("data:image/")).optional().nullable(),
});

export const initCsvSchema = z.object({
  fileName: z.string().optional(),
  totalSize: z.number().optional(),
});

export const broadcastTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  messageBody: z.string().min(1, "Message is required"),
  imageUrl: z.string().url().or(z.string().startsWith("data:image/")).optional().nullable(),
  buttons: z.array(z.any()).optional(),
});
