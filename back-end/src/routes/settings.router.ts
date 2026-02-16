import express from 'express';
import { getSettingsController, updateSettingsController } from '../controllers/settings.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET settings is public (for site title, logo, etc.)
router.get('/', getSettingsController);

// PUT settings is admin only
router.put('/', authenticateToken, isAdmin, updateSettingsController);

export default router;
