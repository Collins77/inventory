import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { createStoreSchema, updateStoreSchema } from "../validators/stores.js";
import { uuidSchema, paginationSchema } from "../validators/common.js";
import { createProductSchema } from "../validators/products.js";
import { computeStoreMetrics } from "../services/metrics.js";
import { formatZodError } from "../validators/zodError.js";

export const storesRouter = Router();

// GET /stores
storesRouter.get("/", async (_req, res, next) => {
  try {
    const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ data: stores });
  } catch (e) {
    next(e);
  }
});

// POST /stores
storesRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createStoreSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(formatZodError(parsed.error, req.body));

    const store = await prisma.store.create({ data: parsed.data });
    res.status(201).json({ data: store });
  } catch (e) {
    next(e);
  }
});

// GET /stores/:id
storesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const store = await prisma.store.findUnique({ where: { id: id.data } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    res.json({ data: store });
  } catch (e) {
    next(e);
  }
});

// PATCH /stores/:id
storesRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const parsed = updateStoreSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const exists = await prisma.store.findUnique({ where: { id: id.data } });
    if (!exists) return res.status(404).json({ error: "Store not found" });

    const updated = await prisma.store.update({ where: { id: id.data }, data: parsed.data });
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
});

// DELETE /stores/:id
storesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const exists = await prisma.store.findUnique({ where: { id: id.data } });
    if (!exists) return res.status(404).json({ error: "Store not found" });

    await prisma.store.delete({ where: { id: id.data } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// GET /stores/:id/products?page=&limit=
storesRouter.get("/:id/products", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const pg = paginationSchema.safeParse(req.query);
    if (!pg.success) return res.status(400).json({ error: "Invalid pagination" });

    const { page, limit } = pg.data;
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      prisma.product.count({ where: { storeId: id.data } }),
      prisma.product.findMany({
        where: { storeId: id.data },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    res.json({
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    next(e);
  }
});

// POST /stores/:id/products
storesRouter.post("/:id/products", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const store = await prisma.store.findUnique({ where: { id: id.data } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const product = await prisma.product.create({
      data: { ...parsed.data, storeId: id.data }
    });

    res.status(201).json({ data: product });
  } catch (e) {
    next(e);
  }
});

// GET /stores/:id/metrics  (non-trivial operation)
storesRouter.get("/:id/metrics", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid store id" });

    const store = await prisma.store.findUnique({ where: { id: id.data } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    const metrics = await computeStoreMetrics(id.data);
    res.json({ data: metrics });
  } catch (e) {
    next(e);
  }
});
