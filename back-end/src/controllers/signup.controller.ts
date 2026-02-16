import { Request, Response } from "express";
import { signupUser } from "../services/user.service.js";

export default async function signupController(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const authProvider = "local";
  try {
    const token = await signupUser(name, email, password, authProvider);
    return res
      .status(201)
      .json({ message: "User created successfully", token });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(409).json({ message: err.message }); // email exists
    }
    return res.status(500).json({ message: "Unknown server error" });
  }
}
