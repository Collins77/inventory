"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStores = getStores;
exports.createStore = createStore;
exports.getStoreById = getStoreById;
exports.updateStore = updateStore;
exports.deleteStore = deleteStore;
exports.getStoreProducts = getStoreProducts;
exports.createStoreProduct = createStoreProduct;
const prisma_js_1 = require("../db/prisma.js");
const cache_js_1 = require("./cache.js");
async function getStores() {
    const cached = cache_js_1.cache.get(cache_js_1.CACHE_KEYS.STORES);
    if (cached)
        return cached;
    const stores = await prisma_js_1.prisma.store.findMany({ orderBy: { createdAt: "desc" } });
    cache_js_1.cache.set(cache_js_1.CACHE_KEYS.STORES, stores);
    return stores;
}
async function createStore(data) {
    const store = await prisma_js_1.prisma.store.create({ data });
    // Invalidate stores cache
    cache_js_1.cache.del(cache_js_1.CACHE_KEYS.STORES);
    return store;
}
async function getStoreById(id) {
    const cacheKey = cache_js_1.CACHE_KEYS.STORE(id);
    const cached = cache_js_1.cache.get(cacheKey);
    if (cached)
        return cached;
    const store = await prisma_js_1.prisma.store.findUnique({ where: { id } });
    if (store) {
        cache_js_1.cache.set(cacheKey, store);
    }
    return store;
}
async function updateStore(id, data) {
    const store = await prisma_js_1.prisma.store.update({ where: { id }, data });
    // Invalidate caches
    cache_js_1.cache.del(cache_js_1.CACHE_KEYS.STORES);
    cache_js_1.cache.del(cache_js_1.CACHE_KEYS.STORE(id));
    return store;
}
async function deleteStore(id) {
    await prisma_js_1.prisma.store.delete({ where: { id } });
    // Invalidate caches
    cache_js_1.cache.del(cache_js_1.CACHE_KEYS.STORES);
    cache_js_1.cache.del(cache_js_1.CACHE_KEYS.STORE(id));
}
async function getStoreProducts(storeId, page, limit) {
    const skip = (page - 1) * limit;
    const [total, products] = await Promise.all([
        prisma_js_1.prisma.product.count({ where: { storeId } }),
        prisma_js_1.prisma.product.findMany({
            where: { storeId },
            include: { store: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        })
    ]);
    return { products, total };
}
async function createStoreProduct(storeId, data) {
    return prisma_js_1.prisma.product.create({
        data: { ...data, storeId }
    });
}
