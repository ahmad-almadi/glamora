import { prisma } from "./src/prisma.js";

async function main() {
    const total = await prisma.product.count();
    console.log("Total products:", total);

    const cats = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
    });
    for (const c of cats) {
        console.log(`  ${c.name}: ${c._count.products} products`);
    }
    await prisma.$disconnect();
}

main();
