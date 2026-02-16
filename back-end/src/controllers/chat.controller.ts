import { Request, Response } from "express";
import { generateReply } from "../services/gemini.service.js";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const reply = await generateReply(message);
    res.json({ reply });
  } catch (error: any) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ error: error.message || "Chatbot error" });
  }
};