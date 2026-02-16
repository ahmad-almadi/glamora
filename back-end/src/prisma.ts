// src/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config"; // يقرأ DATABASE_URL من .env

// إنشاء Pool للاتصال بقاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// إنشاء Adapter
const adapter = new PrismaPg(pool);

// إنشاء PrismaClient مع Adapter
export const prisma = new PrismaClient({ adapter });

// دالة cleanup عند إغلاق السيرفر
export async function disconnect() {
  await prisma.$disconnect();
  await pool.end();
}
