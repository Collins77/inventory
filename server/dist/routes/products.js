"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../db/prisma.js");
const common_js_1 = require("../validators/common.js");
const products_js_1 = require("../validators/products.js");
exports.productsRouter = (0, express_1.Router)();
// GET /products?category=&minPrice=&maxPrice=&minStock=&maxStock=&page=&limit=
exports.productsRouter.get("/", async (req, res, next) => {
    try {
        const pg = common_js_1.paginationSchema.safeParse(req.query);
        if (!pg.success)
            return res.status(400).json({ error: "Invalid pagination" });
        const filters = products_js_1.productsFilterSchema.safeParse(req.query);
        if (!filters.success)
            return res.status(400).json({ error: "Invalid filters" });
        const { page, limit } = pg.data;
        const skip = (page - 1) * limit;
        const { category, minPrice, maxPrice, minStock, maxStock } = filters.data;
        const where = {};
        if (category)
            where.category = category;
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
            prisma_js_1.prisma.product.count({ where }),
            prisma_js_1.prisma.product.findMany({
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
    }
    catch (e) {
        next(e);
    }
});
// PATCH /products/:id
exports.productsRouter.patch("/:id", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid product id" });
        const parsed = products_js_1.updateProductSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const exists = await prisma_js_1.prisma.product.findUnique({ where: { id: id.data } });
        if (!exists)
            return res.status(404).json({ error: "Product not found" });
        const updated = await prisma_js_1.prisma.product.update({
            where: { id: id.data },
            data: parsed.data
        });
        res.json({ data: updated });
    }
    catch (e) {
        next(e);
    }
});
// DELETE /products/:id
exports.productsRouter.delete("/:id", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid product id" });
        const exists = await prisma_js_1.prisma.product.findUnique({ where: { id: id.data } });
        if (!exists)
            return res.status(404).json({ error: "Product not found" });
        await prisma_js_1.prisma.product.delete({ where: { id: id.data } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
