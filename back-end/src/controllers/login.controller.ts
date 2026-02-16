import { Request, Response } from "express";
import { loginUser } from "../services/user.service.js";

export default async function loginController(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;

  try {
    const token = await loginUser(email, password, rememberMe || false);

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "User not found") {
        return res.status(404).json({ message: err.message });
      } else if (err.message === "Invalid password") {
        return res.status(401).json({ message: err.message });
      } else {
        return res.status(500).json({ message: "Server error" });
      }
    }

    // أي شيء آخر غير Error
    return res.status(500).json({ message: "Unknown server error" });
  }
}
