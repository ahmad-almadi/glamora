import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import {
    getCategoriesController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController
} from "../controllers/category.controller.js";
import { upload } from "../middleware/multer.js";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Category Routes - GET is public, write operations require admin
router.get("/categories", getCategoriesController);
router.post("/categories", authenticateToken, isAdmin, createCategoryController);
router.put("/categories/:id", authenticateToken, isAdmin, updateCategoryController);
router.delete("/categories/:id", authenticateToken, isAdmin, deleteCategoryController);

// Product Routes - GET is public, write operations require admin
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticateToken, isAdmin, upload.single('image'), createProduct);
router.put("/:id", authenticateToken, isAdmin, upload.single('image'), updateProduct);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;
