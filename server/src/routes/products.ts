import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { paginationSchema, uuidSchema } from "../validators/common.js";
import { productsFilterSchema, updateProductSchema } from "../validators/products.js";

export const productsRouter = Router();

// GET /products?category=&minPrice=&maxPrice=&minStock=&maxStock=&page=&limit=
productsRouter.get("/", async (req, res, next) => {
  try {
    const pg = paginationSchema.safeParse(req.query);
    if (!pg.success) return res.status(400).json({ error: "Invalid pagination" });

    const filters = productsFilterSchema.safeParse(req.query);
    if (!filters.success) return res.status(400).json({ error: "Invalid filters" });

    const { page, limit } = pg.data;
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, minStock, maxStock } = filters.data;

    const where: any = {};

    if (category) where.category = category;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {})
      };
    }

    if (minStock !== undefined || maxStock !== undefined) {
      where.quantity = {
        ...(minStock !== undefined ? { gte: minStock } : {}),
        ...(maxStock !== undefined ? { lte: maxStock } : {})
      };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { store: { select: { id: true, name: true } } },
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

// PATCH /products/:id
productsRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid product id" });

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const exists = await prisma.product.findUnique({ where: { id: id.data } });
    if (!exists) return res.status(404).json({ error: "Product not found" });

    const updated = await prisma.product.update({
      where: { id: id.data },
      data: parsed.data
    });

    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
});

// DELETE /products/:id
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = uuidSchema.safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ error: "Invalid product id" });

    const exists = await prisma.product.findUnique({ where: { id: id.data } });
    if (!exists) return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { id: id.data } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});