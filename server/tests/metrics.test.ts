import { prisma } from "../src/db/prisma.js";
import { computeStoreMetrics } from "../src/services/metrics.js";

describe("computeStoreMetrics", () => {
  it("computes totals correctly", async () => {
    const store = await prisma.store.create({ data: { name: "Test Store" } });

    await prisma.product.createMany({
      data: [
        { storeId: store.id, name: "A", category: "X", price: 100, quantity: 2 }, // 200
        { storeId: store.id, name: "B", category: "X", price: 50, quantity: 3 }   // 150
      ]
    });

    const m = await computeStoreMetrics(store.id);

    expect(m.totalProducts).toBe(2);
    expect(m.totalStock).toBe(5);
    expect(m.totalInventoryValue).toBe(350);
  });
});
