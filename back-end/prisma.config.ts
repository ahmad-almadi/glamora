import "dotenv/config";
import { defineConfig } from "@prisma/config"; // التصحيح هنا

export default defineConfig({
  // Prisma v7 ستحتاج لمعرفة مكان ملف السكيما
  schema: "prisma/schema.prisma", 
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts", 
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});