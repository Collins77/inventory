"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRouter = void 0;
const express_1 = require("express");
const stores_js_1 = require("../validators/stores.js");
const common_js_1 = require("../validators/common.js");
const products_js_1 = require("../validators/products.js");
const metrics_js_1 = require("../services/metrics.js");
const zodError_js_1 = require("../validators/zodError.js");
const express_js_1 = require("../types/express.js");
const stores_js_2 = require("../services/stores.js");
exports.storesRouter = (0, express_1.Router)();
// GET /stores
exports.storesRouter.get("/", (0, express_js_1.asyncHandler)(async (req, res) => {
    const stores = await (0, stores_js_2.getStores)();
    res.json({ data: stores });
}));
// POST /stores
exports.storesRouter.post("/", (0, express_js_1.asyncHandler)(async (req, res) => {
    const parsed = stores_js_1.createStoreSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, zodError_js_1.formatZodError)(parsed.error, req.body));
    }
    const store = await (0, stores_js_2.createStore)(parsed.data);
    res.status(201).json({ data: store });
}));
// GET /stores/:id
exports.storesRouter.get("/:id", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const store = await (0, stores_js_2.getStoreById)(id.data);
    if (!store) {
        return res.status(404).json({ error: "Store not found" });
    }
    res.json({ data: store });
}));
// PATCH /stores/:id
exports.storesRouter.patch("/:id", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const parsed = stores_js_1.updateStoreSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const exists = await (0, stores_js_2.getStoreById)(id.data);
    if (!exists) {
        return res.status(404).json({ error: "Store not found" });
    }
    const updated = await (0, stores_js_2.updateStore)(id.data, parsed.data);
    res.json({ data: updated });
}));
// DELETE /stores/:id
exports.storesRouter.delete("/:id", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const exists = await (0, stores_js_2.getStoreById)(id.data);
    if (!exists) {
        return res.status(404).json({ error: "Store not found" });
    }
    await (0, stores_js_2.deleteStore)(id.data);
    res.status(204).send();
}));
// GET /stores/:id/products?page=&limit=
exports.storesRouter.get("/:id/products", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const pg = common_js_1.paginationSchema.safeParse(req.query);
    if (!pg.success) {
        return res.status(400).json({ error: "Invalid pagination" });
    }
    const { page, limit } = pg.data;
    const store = await (0, stores_js_2.getStoreById)(id.data);
    if (!store) {
        return res.status(404).json({ error: "Store not found" });
    }
    const { products, total } = await (0, stores_js_2.getStoreProducts)(id.data, page, limit);
    res.json({
        data: products,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}));
// POST /stores/:id/products
exports.storesRouter.post("/:id/products", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const store = await (0, stores_js_2.getStoreById)(id.data);
    if (!store) {
        return res.status(404).json({ error: "Store not found" });
    }
    const parsed = products_js_1.createStoreProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const product = await (0, stores_js_2.createStoreProduct)(id.data, parsed.data);
    res.status(201).json({ data: product });
}));
// GET /stores/:id/metrics  (non-trivial operation)
exports.storesRouter.get("/:id/metrics", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid store id" });
    }
    const store = await (0, stores_js_2.getStoreById)(id.data);
    if (!store) {
        return res.status(404).json({ error: "Store not found" });
    }
    const metrics = await (0, metrics_js_1.computeStoreMetrics)(id.data);
    res.json({ data: metrics });
}));
