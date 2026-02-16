import express from 'express';
import { createOrderController, getOrdersController, updateOrderStatusController, getOrderByIdController } from '../controllers/order.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order routes require authentication
router.post('/', authenticateToken, createOrderController);
router.get('/', authenticateToken, getOrdersController);
router.get('/:id', authenticateToken, getOrderByIdController);
router.patch('/:id/status', authenticateToken, updateOrderStatusController);

export default router;
