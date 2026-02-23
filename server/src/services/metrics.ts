import { prisma } from "../db/prisma.js";

export async function computeStoreMetrics(storeId: string) {
  const [totalProducts, qtyAgg, items] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.product.aggregate({
      where: { storeId },
      _sum: { quantity: true }
    }),
    prisma.product.findMany({
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