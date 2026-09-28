import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid id");
const optionalText = (max) => z.string().trim().max(max).optional();
const url = z.string().url().max(2048).or(z.literal("")).optional();

export const sellerCreateSchema = z.object({
  storeName: z.string().trim().min(2).max(120),
  description: optionalText(2000),
  contactEmail: z.string().email().max(254).optional(),
  contactPhone: z.string().trim().min(7).max(20).optional(),
  address: z.object({
    line1: optionalText(200), line2: optionalText(200), city: optionalText(100),
    state: optionalText(100), postalCode: optionalText(20), country: optionalText(100)
  }).optional()
}).strict();

export const sellerUpdateSchema = sellerCreateSchema.partial().strict();

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  authors: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  description: optionalText(5000),
  isbn: z.string().trim().max(20).optional(),
  category: z.string().trim().min(1).max(80),
  language: optionalText(60),
  publisher: optionalText(160),
  publishedYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  pageCount: z.coerce.number().int().positive().optional(),
  coverImageUrl: url
}).strict();

export const inventoryCreateSchema = z.object({
  book: bookCreateSchema.optional(),
  bookId: id.optional(),
  condition: z.enum(["new", "like-new", "good", "acceptable"]).default("good"),
  quantity: z.coerce.number().int().min(0).max(100000),
  rentPricePerDay: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  notes: optionalText(1000)
}).strict().refine((value) => Boolean(value.book) !== Boolean(value.bookId), {
  message: "Provide exactly one of book or bookId",
  path: ["bookId"]
});

export const inventoryUpdateSchema = z.object({
  condition: z.enum(["new", "like-new", "good", "acceptable"]).optional(),
  quantity: z.coerce.number().int().min(0).max(100000).optional(),
  rentPricePerDay: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  notes: optionalText(1000)
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const inventoryParamsSchema = z.object({ id }).strict();

const positiveInt = (fallback, max) => z.coerce.number().int().min(1).max(max).default(fallback);
export const bookListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  author: z.string().trim().max(120).optional(),
  language: z.string().trim().max(60).optional(),
  city: z.string().trim().max(100).optional(),
  condition: z.enum(["new", "like-new", "good", "acceptable"]).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  page: positiveInt(1, 100000),
  limit: positiveInt(20, 100),
  sort: z.enum(["newest", "title", "rent-low", "rent-high"]).default("newest")
}).strict().refine((q) => q.minRent === undefined || q.maxRent === undefined || q.minRent <= q.maxRent, {
  message: "minRent must be less than or equal to maxRent"
});

export const bookIdParamsSchema = z.object({ id }).strict();
