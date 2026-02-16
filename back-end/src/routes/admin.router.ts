import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import { getSettingsController, updateSettingsController } from "../controllers/settings.controller.js";
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Apply middleware to all routes in this router
router.use(authenticateToken, isAdmin);

router.get("/users", adminController);

// Settings Routes
router.get("/settings", getSettingsController);

router.get('/dashboard', getDashboardStats);

router.put("/settings", updateSettingsController);


export default router;