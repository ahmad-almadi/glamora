import "dotenv/config";
import app from "./app.js";
import { prisma } from "./prisma.js";

const port = process.env.PORT || 3000;
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

async function start() {
  try {
    await prisma.$connect(); // connect to DB
    console.log("✅ DB connected");

    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

start();
