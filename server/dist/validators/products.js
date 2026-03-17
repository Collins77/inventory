"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsFilterSchema = exports.updateProductSchema = exports.createStoreProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    storeId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(120),
    category: zod_1.z.string().min(1).max(80),
    price: zod_1.z.number().int().min(0),
    quantity: zod_1.z.number().int().min(0)
});
exports.createStoreProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    category: zod_1.z.string().min(1).max(80),
    price: zod_1.z.number().int().min(0),
    quantity: zod_1.z.number().int().min(0)
});
exports.updateProductSchema = exports.createProductSchema.omit({ storeId: true }).partial();
exports.productsFilterSchema = zod_1.z.object({
    category: zod_1.z.string().min(1).max(80).optional(),
    minPrice: zod_1.z.coerce.number().int().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().int().min(0).optional(),
    minStock: zod_1.z.coerce.number().int().min(0).optional(),
    maxStock: zod_1.z.coerce.number().int().min(0).optional()
});
