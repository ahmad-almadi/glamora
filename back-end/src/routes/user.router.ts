import express from 'express';
import { updateProfileController, getProfileController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfileController);
router.put('/profile', authenticateToken, updateProfileController);

export default router;
