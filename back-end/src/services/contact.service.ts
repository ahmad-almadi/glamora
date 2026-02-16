import { prisma } from "../prisma.js";

interface ContactMessageData {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
}

export const createContactMessage = async (data: ContactMessageData) => {
    return await prisma.contactMessage.create({
        data
    });
};

export const getAllContactMessages = async () => {
    return await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" }
    });
};

export const markContactMessageAsRead = async (id: string) => {
    return await prisma.contactMessage.update({
        where: { id },
        data: { isRead: true }
    });
};

export const deleteContactMessage = async (id: string) => {
    return await prisma.contactMessage.delete({
        where: { id }
    });
};
