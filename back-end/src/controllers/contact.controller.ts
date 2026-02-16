import { Request, Response } from 'express';
import {
    createContactMessage,
    getAllContactMessages,
    markContactMessageAsRead,
    deleteContactMessage
} from '../services/contact.service.js';

// Public endpoint - anyone can submit a contact form
export const createContactController = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const contactMessage = await createContactMessage({
            firstName,
            lastName,
            email,
            subject,
            message
        });

        res.status(201).json({
            message: "Thank you for your message! We'll get back to you soon.",
            data: contactMessage
        });
    } catch (error) {
        console.error("Error creating contact message:", error);
        res.status(500).json({ message: "Failed to send message. Please try again." });
    }
};

// Admin only - get all contact messages
export const getContactMessagesController = async (req: Request, res: Response) => {
    try {
        const messages = await getAllContactMessages();
        res.json(messages);
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// Admin only - mark message as read
export const markReadController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const message = await markContactMessageAsRead(id as string);
        res.json(message);
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ message: "Failed to mark message as read" });
    }
};

// Admin only - delete message
export const deleteContactMessageController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteContactMessage(id as string);
        res.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Failed to delete message" });
    }
};
