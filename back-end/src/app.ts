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


app.use(cors({
  origin: "https://glamora.up.railway.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json()); // للتعامل مع JSON body
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});





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

// 404 handler - must be after all routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Route not found",
    method: req.method,
    path: req.path 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path,
    method: req.method
  });
});

export default app;

// Force restart for Prisma Client update
