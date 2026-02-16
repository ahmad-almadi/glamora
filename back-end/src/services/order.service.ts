import { prisma } from "../prisma.js";
import { OrderStatus } from "@prisma/client";

export const createOrder = async (
    userId: string,
    items: { productId: string; quantity: number; price: number; size?: string; color?: string }[],
    totalAmount: number,
    shippingAddress: string,
    paymentMethod: string = "Cash on Delivery"
) => {
    // Generates a random order number like "ORD-123456"
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    return await prisma.$transaction(async (tx) => {
        // 1. Create the order first (or prepare data)
        const order = await tx.order.create({
            data: {
                orderNumber,
                userId,
                totalAmount,
                shippingAddress,
                paymentMethod,
                status: "PENDING",
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                        color: item.color
                    }))
                }
            },
            include: {
                items: true
            }
        });

        // 2. Deduct stock for each item
        for (const item of items) {
            // If the item has size/color, try to find the variant
            if (item.size && item.color) {
                const variant = await tx.productVariant.findFirst({
                    where: {
                        productId: item.productId,
                        size: item.size,
                        color: item.color
                    }
                });

                if (variant) {
                    if (variant.stock < item.quantity) {
                        throw new Error(`Insufficient stock for product ${item.productId} (${item.size}, ${item.color})`);
                    }
                    // Deduct from variant
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: variant.stock - item.quantity }
                    });
                }
            }

            // Also deduct from main product total quantity (if you track it)
            // Assuming Product has a 'quantity' field for total stock
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }
                }
            });
        }

        return order;
    });
};

export const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            user: {
                select: { name: true, email: true, id: true } // Assuming User has phone? No storePhone in User model from user request.
            },
            items: {
                include: {
                    product: {
                        select: { name: true, imageUrl: true }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    return await prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
};

export const getOrderById = async (orderId: string) => {
    return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: { name: true, email: true }
            },
            items: {
                include: {
                    product: {
                        select: { name: true, imageUrl: true }
                    }
                }
            }
        }
    })
}
