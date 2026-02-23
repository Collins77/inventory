"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../db/prisma.js");
const stores_js_1 = require("../validators/stores.js");
const common_js_1 = require("../validators/common.js");
const products_js_1 = require("../validators/products.js");
const metrics_js_1 = require("../services/metrics.js");
const zodError_js_1 = require("../validators/zodError.js");
exports.storesRouter = (0, express_1.Router)();
// GET /stores
exports.storesRouter.get("/", async (_req, res, next) => {
    try {
        const stores = await prisma_js_1.prisma.store.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ data: stores });
    }
    catch (e) {
        next(e);
    }
});
// POST /stores
exports.storesRouter.post("/", async (req, res, next) => {
    try {
        const parsed = stores_js_1.createStoreSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json((0, zodError_js_1.formatZodError)(parsed.error, req.body));
        const store = await prisma_js_1.prisma.store.create({ data: parsed.data });
        res.status(201).json({ data: store });
    }
    catch (e) {
        next(e);
    }
});
// GET /stores/:id
exports.storesRouter.get("/:id", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const store = await prisma_js_1.prisma.store.findUnique({ where: { id: id.data } });
        if (!store)
            return res.status(404).json({ error: "Store not found" });
        res.json({ data: store });
    }
    catch (e) {
        next(e);
    }
});
// PATCH /stores/:id
exports.storesRouter.patch("/:id", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const parsed = stores_js_1.updateStoreSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const exists = await prisma_js_1.prisma.store.findUnique({ where: { id: id.data } });
        if (!exists)
            return res.status(404).json({ error: "Store not found" });
        const updated = await prisma_js_1.prisma.store.update({ where: { id: id.data }, data: parsed.data });
        res.json({ data: updated });
    }
    catch (e) {
        next(e);
    }
});
// DELETE /stores/:id
exports.storesRouter.delete("/:id", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const exists = await prisma_js_1.prisma.store.findUnique({ where: { id: id.data } });
        if (!exists)
            return res.status(404).json({ error: "Store not found" });
        await prisma_js_1.prisma.store.delete({ where: { id: id.data } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
// GET /stores/:id/products?page=&limit=
exports.storesRouter.get("/:id/products", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const pg = common_js_1.paginationSchema.safeParse(req.query);
        if (!pg.success)
            return res.status(400).json({ error: "Invalid pagination" });
        const { page, limit } = pg.data;
        const skip = (page - 1) * limit;
        const [total, products] = await Promise.all([
            prisma_js_1.prisma.product.count({ where: { storeId: id.data } }),
            prisma_js_1.prisma.product.findMany({
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
    }
    catch (e) {
        next(e);
    }
});
// POST /stores/:id/products
exports.storesRouter.post("/:id/products", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const store = await prisma_js_1.prisma.store.findUnique({ where: { id: id.data } });
        if (!store)
            return res.status(404).json({ error: "Store not found" });
        const parsed = products_js_1.createProductSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: parsed.error.flatten() });
        const product = await prisma_js_1.prisma.product.create({
            data: { ...parsed.data, storeId: id.data }
        });
        res.status(201).json({ data: product });
    }
    catch (e) {
        next(e);
    }
});
// GET /stores/:id/metrics  (non-trivial operation)
exports.storesRouter.get("/:id/metrics", async (req, res, next) => {
    try {
        const id = common_js_1.uuidSchema.safeParse(req.params.id);
        if (!id.success)
            return res.status(400).json({ error: "Invalid store id" });
        const store = await prisma_js_1.prisma.store.findUnique({ where: { id: id.data } });
        if (!store)
            return res.status(404).json({ error: "Store not found" });
        const metrics = await (0, metrics_js_1.computeStoreMetrics)(id.data);
        res.json({ data: metrics });
    }
    catch (e) {
        next(e);
    }
});
