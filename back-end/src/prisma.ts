// src/prisma.ts
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// Create PrismaClient instance
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Cleanup function when server closes
export async function disconnect() {
  await prisma.$disconnect();
}

