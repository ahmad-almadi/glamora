import { Request, Response } from 'express';
import { createOrder, getAllOrders, updateOrderStatus, getOrderById } from '../services/order.service.js';

export const createOrderController = async (req: Request, res: Response) => {
    try {
        const { userId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
        const order = await createOrder(userId, items, totalAmount, shippingAddress, paymentMethod);
        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
};

export const getOrdersController = async (req: Request, res: Response) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(String(id));
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    }
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const updatedOrder = await updateOrderStatus(String(id), status);
        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
