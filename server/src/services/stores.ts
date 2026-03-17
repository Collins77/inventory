import { prisma } from "../db/prisma.js";
import type { Store, Product } from "../generated/prisma/client";
import { cache, CACHE_KEYS } from "./cache.js";

export async function getStores(): Promise<Store[]> {
  const cached = cache.get<Store[]>(CACHE_KEYS.STORES);
  if (cached) return cached;

  const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
  cache.set(CACHE_KEYS.STORES, stores);
  return stores;
}

export async function createStore(data: { name: string; location?: string }): Promise<Store> {
  const store = await prisma.store.create({ data });
  // Invalidate stores cache
  cache.del(CACHE_KEYS.STORES);
  return store;
}

export async function getStoreById(id: string): Promise<Store | null> {
  const cacheKey = CACHE_KEYS.STORE(id);
  const cached = cache.get<Store>(cacheKey);
  if (cached) return cached;

  const store = await prisma.store.findUnique({ where: { id } });
  if (store) {
    cache.set(cacheKey, store);
  }
  return store;
}

export async function updateStore(id: string, data: Partial<{ name: string; location?: string }>): Promise<Store> {
  const store = await prisma.store.update({ where: { id }, data });
  // Invalidate caches
  cache.del(CACHE_KEYS.STORES);
  cache.del(CACHE_KEYS.STORE(id));
  return store;
}

export async function deleteStore(id: string): Promise<void> {
  await prisma.store.delete({ where: { id } });
  // Invalidate caches
  cache.del(CACHE_KEYS.STORES);
  cache.del(CACHE_KEYS.STORE(id));
}

export async function getStoreProducts(storeId: string, page: number, limit: number): Promise<{
  products: (Product & { store: Pick<Store, "id" | "name"> })[];
  total: number;
}> {
  const skip = (page - 1) * limit;
  const [total, products] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.product.findMany({
      where: { storeId },
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })
  ]);

  return { products, total };
}

export async function createStoreProduct(storeId: string, data: {
  name: string;
  category: string;
  price: number;
  quantity: number;
}): Promise<Product> {
  return prisma.product.create({
    data: { ...data, storeId }
  });
}