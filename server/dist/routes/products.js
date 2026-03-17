"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const common_js_1 = require("../validators/common.js");
const products_js_1 = require("../validators/products.js");
const express_js_1 = require("../types/express.js");
const products_js_2 = require("../services/products.js");
const stores_js_1 = require("../services/stores.js");
exports.productsRouter = (0, express_1.Router)();
// POST /products
exports.productsRouter.post("/", (0, express_js_1.asyncHandler)(async (req, res) => {
    const parsed = products_js_1.createProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { storeId, ...productData } = parsed.data;
    const store = await (0, stores_js_1.getStoreById)(storeId);
    if (!store) {
        return res.status(404).json({ error: "Store not found" });
    }
    const product = await (0, stores_js_1.createStoreProduct)(storeId, productData);
    res.status(201).json({ data: product });
}));
// GET /products?category=&minPrice=&maxPrice=&minStock=&maxStock=&page=&limit=
exports.productsRouter.get("/", (0, express_js_1.asyncHandler)(async (req, res) => {
    const pg = common_js_1.paginationSchema.safeParse(req.query);
    if (!pg.success) {
        return res.status(400).json({ error: "Invalid pagination" });
    }
    const filters = products_js_1.productsFilterSchema.safeParse(req.query);
    if (!filters.success) {
        return res.status(400).json({ error: "Invalid filters" });
    }
    const { page, limit } = pg.data;
    const { products, total } = await (0, products_js_2.getProducts)(filters.data, page, limit);
    res.json({
        data: products,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}));
// PATCH /products/:id
exports.productsRouter.patch("/:id", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid product id" });
    }
    const parsed = products_js_1.updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const exists = await (0, products_js_2.getProductById)(id.data);
    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }
    const updated = await (0, products_js_2.updateProduct)(id.data, parsed.data);
    res.json({ data: updated });
}));
// DELETE /products/:id
exports.productsRouter.delete("/:id", (0, express_js_1.asyncHandler)(async (req, res) => {
    const id = common_js_1.uuidSchema.safeParse(req.params.id);
    if (!id.success) {
        return res.status(400).json({ error: "Invalid product id" });
    }
    const exists = await (0, products_js_2.getProductById)(id.data);
    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }
    await (0, products_js_2.deleteProduct)(id.data);
    res.status(204).send();
}));
