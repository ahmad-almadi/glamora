import { Request, Response } from 'express';
import { updateUser, findUserById } from '../services/user.service.js';

interface AuthRequest extends Request {
    user?: any;
}

export const getProfileController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

export const updateProfileController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.userId;
        const updatedUser = await updateUser(userId, req.body);

        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;

        res.json(userWithoutPassword);
    } catch (error: any) {
        console.error("Update profile error:", error);
        res.status(400).json({ message: error.message || "Failed to update profile" });
    }
};
