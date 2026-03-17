import { Router } from "express";
import { createStoreSchema, updateStoreSchema } from "../validators/stores.js";
import { uuidSchema, paginationSchema } from "../validators/common.js";
import { createStoreProductSchema } from "../validators/products.js";
import { computeStoreMetrics } from "../services/metrics.js";
import { formatZodError } from "../validators/zodError.js";
import { asyncHandler } from "../types/express.js";
import type {
  CreateStoreRequest,
  UpdateStoreRequest,
  CreateStoreProductRequest,
  StoreResponse,
  ProductResponse,
  PaginatedProductsResponse,
  StoreMetrics as StoreMetricsType
} from "../types/api.js";
import {
  getStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore,
  getStoreProducts,
  createStoreProduct
} from "../services/stores.js";

export const storesRouter = Router();

// GET /stores
storesRouter.get("/", asyncHandler(async (req, res) => {
  const stores = await getStores();
  res.json({ data: stores });
}));

// POST /stores
storesRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(formatZodError(parsed.error, req.body));
  }

  const store = await createStore(parsed.data);
  res.status(201).json({ data: store });
}));

// GET /stores/:id
storesRouter.get("/:id", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const store = await getStoreById(id.data);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  res.json({ data: store });
}));

// PATCH /stores/:id
storesRouter.patch("/:id", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const parsed = updateStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const exists = await getStoreById(id.data);
  if (!exists) {
    return res.status(404).json({ error: "Store not found" });
  }

  const updated = await updateStore(id.data, parsed.data);
  res.json({ data: updated });
}));

// DELETE /stores/:id
storesRouter.delete("/:id", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const exists = await getStoreById(id.data);
  if (!exists) {
    return res.status(404).json({ error: "Store not found" });
  }

  await deleteStore(id.data);
  res.status(204).send();
}));

// GET /stores/:id/products?page=&limit=
storesRouter.get("/:id/products", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const pg = paginationSchema.safeParse(req.query);
  if (!pg.success) {
    return res.status(400).json({ error: "Invalid pagination" });
  }

  const { page, limit } = pg.data;

  const store = await getStoreById(id.data);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const { products, total } = await getStoreProducts(id.data, page, limit);

  res.json({
    data: products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}));

// POST /stores/:id/products
storesRouter.post("/:id/products", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const store = await getStoreById(id.data);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const parsed = createStoreProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const product = await createStoreProduct(id.data, parsed.data);

  res.status(201).json({ data: product });
}));

// GET /stores/:id/metrics  (non-trivial operation)
storesRouter.get("/:id/metrics", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid store id" });
  }

  const store = await getStoreById(id.data);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const metrics = await computeStoreMetrics(id.data);
  res.json({ data: metrics });
}));
