"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeStoreMetrics = computeStoreMetrics;
const prisma_js_1 = require("../db/prisma.js");
async function computeStoreMetrics(storeId) {
    const [totalProducts, qtyAgg, items] = await Promise.all([
        prisma_js_1.prisma.product.count({ where: { storeId } }),
        prisma_js_1.prisma.product.aggregate({
            where: { storeId },
            _sum: { quantity: true }
        }),
        prisma_js_1.prisma.product.findMany({
            where: { storeId },
            select: { price: true, quantity: true }
        })
    ]);
    const totalInventoryValue = items.reduce((acc, p) => acc + p.price * p.quantity, 0);
    return {
        totalProducts,
        totalStock: qtyAgg._sum.quantity ?? 0,
        totalInventoryValue
    };
}
