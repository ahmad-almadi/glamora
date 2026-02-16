import { Router } from "express";
import {
    createContactController,
    getContactMessagesController,
    markReadController,
    deleteContactMessageController
} from "../controllers/contact.controller.js";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public endpoint - anyone can submit a contact form
router.post("/", createContactController);

// Admin-only endpoints
router.get("/", authenticateToken, isAdmin, getContactMessagesController);
router.put("/:id/read", authenticateToken, isAdmin, markReadController);
router.delete("/:id", authenticateToken, isAdmin, deleteContactMessageController);

export default router;
