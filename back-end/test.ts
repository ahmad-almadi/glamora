console.log("Test file works!");

import { PrismaClient } from "@prisma/client";

console.log("Prisma imported");

const prisma = new PrismaClient();

console.log("Prisma client created");

async function test() {
  console.log("Test function called");
  const count = await prisma.category.count();
  console.log("Categories:", count);
}

test().then(() => {
  console.log("Done");
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
