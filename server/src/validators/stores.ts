import { z } from "zod";

const requiredString = (field: string, max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .min(1, `${field} is required`)
      .max(max, `${field} must be at most ${max} characters`)
  );

const optionalString = (field: string, max: number) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().max(max, `"${field}" must be at most ${max} characters`).optional()
  );

export const createStoreSchema = z.object({
  name: requiredString("name", 120),
  location: optionalString("location", 200),
});

export const updateStoreSchema = createStoreSchema.partial();
