import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  price: z.number().int().min(0),
  quantity: z.number().int().min(0)
});

export const updateProductSchema = createProductSchema.partial();

export const productsFilterSchema = z.object({
  category: z.string().min(1).max(80).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  maxStock: z.coerce.number().int().min(0).optional()
});
