import { prisma } from "../db/prisma.js";
import type { Product, Store } from "../generated/prisma/client";

export type ProductsFilter = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
};

export async function getProducts(
  filters: ProductsFilter,
  page: number,
  limit: number
): Promise<{
  products: (Product & { store: Pick<Store, "id" | "name"> })[];
  total: number;
}> {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.category) where.category = filters.category;

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
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    })
  ]);

  return { products, total };
}

export async function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

export async function updateProduct(id: string, data: Partial<{
  name: string;
  category: string;
  price: number;
  quantity: number;
}>): Promise<Product> {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}