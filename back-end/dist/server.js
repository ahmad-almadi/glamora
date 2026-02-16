import app from "./app.js";
import { prisma } from "./prisma.js";
const port = process.env.PORT;
async function start() {
    try {
        await prisma.$connect(); // connect to DB
        console.log("✅ DB connected");
        app.listen(port, () => {
            console.log(`✅ Server running http://localhost:${port}`);
        });
    }
    catch (err) {
        console.error("❌ DB connection failed:", err);
        process.exit(1);
    }
}
start();
