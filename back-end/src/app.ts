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

// CORS configuration - allow both production and development
const allowedOrigins = [
  "https://glamora.up.railway.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Add environment variable support
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(null, true); // Allow all origins for now to debug
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests BEFORE other middleware
app.options("*", cors());

app.use(express.json()); // للتعامل مع JSON body
app.use("/uploads", express.static("uploads"));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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

export default app;

// Force restart for Prisma Client update
