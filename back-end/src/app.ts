import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.routers.js";
import loginRouter from "./routes/login.router.js";
import signupRouter from "./routes/signup.router.js";
import googleRouter from "./routes/google.routers.js";
import adminRouter from "./routes/admin.router.js";
import settingsRouter from "./routes/settings.router.js";
import orderRouter from "./routes/order.router.js";
import contactRouter from "./routes/contact.router.js";
import userRouter from "./routes/user.router.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
app.use(
  cors({ origin: ["https://glamora.up.railway.app"], credentials: true }),
); // السماح للفرونت
app.use(express.json()); // للتعامل مع JSON body
app.use("/uploads", express.static("uploads"));

app.use("/api/chat", chatRoutes);
app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/products", productsRouter);
app.use("/google", googleRouter);
app.use("/admin", adminRouter);
app.use("/settings", settingsRouter);
app.use("/orders", orderRouter);
app.use("/contact", contactRouter);
app.use("/users", userRouter);

export default app;

// Force restart for Prisma Client update
