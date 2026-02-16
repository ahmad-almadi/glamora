import express from 'express';
import homeRouters from "./routes/home.routers.js";
import productsRouter from "./routes/products.routers.js";
import loginRouter from "./routes/login.router.js";
const app = express();
app.use("/login", loginRouter);
app.use("/", homeRouters);
app.use("/products", productsRouter);
export default app;
