import "dotenv/config";
import app from "./app.js";
import { prisma } from "./prisma.js";

// Force Railway to use latest code
const port = process.env.PORT || 3000;

console.log("🚀 Starting server...");
console.log("📍 PORT:", port);
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");
console.log("🗄️  DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

async function start() {
  try {
    console.log("🔌 Connecting to database...");
    await prisma.$connect();
    console.log("✅ DB connected successfully");

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Health check: http://0.0.0.0:${port}/health`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    console.error("Error details:", err);
    process.exit(1);
  }
}

start();
