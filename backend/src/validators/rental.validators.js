import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid id");
const isoDateTime = z.string().datetime({ offset: true });
const note = z.string().trim().max(1000).optional();

export const createRentalSchema = z.object({
  inventoryId: id,
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  startAt: isoDateTime,
  endAt: isoDateTime,
  renterNote: note
}).strict().refine((value) => new Date(value.endAt) > new Date(value.startAt), {
  message: "endAt must be later than startAt",
  path: ["endAt"]
});

export const rentalIdParamsSchema = z.object({ id }).strict();

export const rentalListQuerySchema = z.object({
  status: z.enum(["requested", "accepted", "rejected", "cancelled", "completed"]).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).strict();

export const rentalDecisionSchema = z.object({
  decision: z.enum(["accept", "reject"]),
  note
}).strict();

export const rentalCancelSchema = z.preprocess(
  (value) => value ?? {},
  z.object({ note }).strict()
);
