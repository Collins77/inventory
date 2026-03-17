"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const prisma_js_1 = require("../db/prisma.js");
async function getProducts(filters, page, limit) {
    const skip = (page - 1) * limit;
    const where = {};
    if (filters.category)
        where.category = filters.category;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {})
        };
    }
    if (filters.minStock !== undefined || filters.maxStock !== undefined) {
        where.quantity = {
            ...(filters.minStock !== undefined ? { gte: filters.minStock } : {}),
            ...(filters.maxStock !== undefined ? { lte: filters.maxStock } : {})
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
    return { products, total };
}
async function getProductById(id) {
    return prisma_js_1.prisma.product.findUnique({ where: { id } });
}
async function updateProduct(id, data) {
    return prisma_js_1.prisma.product.update({ where: { id }, data });
}
async function deleteProduct(id) {
    await prisma_js_1.prisma.product.delete({ where: { id } });
}
