import { Request, Response } from "express";
import { getAllUsersService } from "../services/product.service.js"; 

export default async function adminController(req: Request, res: Response) {
    try {
        const users = await getAllUsersService();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}