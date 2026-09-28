import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid id");
const note = z.string().trim().max(1000).optional();

export const createOrderSchema = z.object({
  rentalId: id,
  deliveryAddress: z.object({
    recipientName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(20).regex(/^[+()\d.\-\s]+$/, "Enter a valid phone number"),
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(100).default("India")
  }).strict(),
  deliveryInstructions: note
}).strict();

export const orderIdParamsSchema = z.object({ id }).strict();

export const orderListQuerySchema = z.object({
  status: z.enum(["pending_payment", "paid", "processing", "ready_for_dispatch", "in_transit", "delivered", "cancelled", "refunded"]).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).strict();

export const cancelOrderSchema = z.preprocess(
  (value) => value ?? {},
  z.object({ note }).strict()
);
