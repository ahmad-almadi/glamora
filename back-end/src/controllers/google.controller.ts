import { Request, Response } from "express";
import { findUserByEmail, createUser } from "../services/user.service.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export default async function GoogleController(
  req: Request,
  res: Response
) {
  const { email, name, googleId, rememberMe } = req.body;
  const authProvider = "google";

  // Token expires in 7 days if "Remember Me" is checked, otherwise 1 hour
  const expiresIn = rememberMe ? "7d" : "1h";

  try {
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(name, email, authProvider, undefined, googleId);
      const token = jwt.sign({ userId: user.id, name: user.name, role: user.role }, JWT_SECRET, {
        expiresIn,
      });
      return res.status(201).json({
        message: "User created via Google",
        token,
      });
    } else {
      const token = jwt.sign({ userId: user.id, name: user.name, role: user.role }, JWT_SECRET, {
        expiresIn,
      });
      return res.status(200).json({
        message: "Google login successful",
        token,
      });
    }
  } catch (error: unknown) {
    return res.status(500).json({ message: "Server error" });
  }
}
