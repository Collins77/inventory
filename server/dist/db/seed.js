"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = require("./prisma.js");
async function main() {
    await prisma_js_1.prisma.product.deleteMany();
    await prisma_js_1.prisma.store.deleteMany();
    const nairobi = await prisma_js_1.prisma.store.create({
        data: { name: "Nairobi Central", location: "Nairobi" }
    });
    const mombasa = await prisma_js_1.prisma.store.create({
        data: { name: "Mombasa Branch", location: "Mombasa" }
    });
    const eldoret = await prisma_js_1.prisma.store.create({
        data: { name: "Eldoret Outlet", location: "Eldoret" }
    });
    await prisma_js_1.prisma.product.createMany({
        data: [
            { storeId: nairobi.id, name: "USB-C Cable", category: "Electronics", price: 800, quantity: 25 },
            { storeId: nairobi.id, name: "Wireless Mouse", category: "Electronics", price: 2500, quantity: 14 },
            { storeId: nairobi.id, name: "Notebook A5", category: "Stationery", price: 300, quantity: 120 },
            { storeId: mombasa.id, name: "Rice 5kg", category: "Groceries", price: 1200, quantity: 40 },
            { storeId: mombasa.id, name: "Cooking Oil 1L", category: "Groceries", price: 650, quantity: 55 },
            { storeId: mombasa.id, name: "Pen Pack", category: "Stationery", price: 200, quantity: 80 },
            { storeId: eldoret.id, name: "Headphones", category: "Electronics", price: 4500, quantity: 10 },
            { storeId: eldoret.id, name: "Sugar 2kg", category: "Groceries", price: 420, quantity: 60 },
            { storeId: eldoret.id, name: "Stapler", category: "Stationery", price: 550, quantity: 18 }
        ]
    });
    console.log("Seed complete ✅");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    // In adapter mode, disconnect still exists and is safe.
    await prisma_js_1.prisma.$disconnect();
});
