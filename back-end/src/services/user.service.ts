import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

export const createUser = async (
  name: string,
  email: string,
  authProvider: string,
  password?: string,
  googleId?: string
) => {
  let hashPassword: string | undefined;
  if (password) {
    const saltRound = 12;
    hashPassword = await bcrypt.hash(password, saltRound);
  }
  const user = await prisma.user.create({
    data: { name, email, password: hashPassword, authProvider, googleId },
  });
  return user;
};
export const signupUser = async (
  name: string,
  email: string,
  authProvider: string,
  password: string
) => {
  const user = await findUserByEmail(email);
  if (user) throw new Error("Email already used");
  const newUser = await createUser(name, email, password, authProvider);
  const token = jwt.sign(
    { userId: newUser.id, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return token;
};

export const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  const user = await findUserByEmail(email);

  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("This account uses Google login");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid password");

  // Token expires in 7 days if "Remember Me" is checked, otherwise 1 hour
  const expiresIn = rememberMe ? "7d" : "1h";

  const token = jwt.sign({ userId: user.id, name: user.name, role: user.role }, JWT_SECRET, {
    expiresIn,
  });
  return token;
};

export const updateUser = async (userId: string, data: any) => {
  const { currentPassword, ...updateData } = data;

  if (!currentPassword) {
    throw new Error("Current password is required to save changes");
  }

  const user = await findUserById(userId);
  if (!user || !user.password) {
    throw new Error("User not found or uses external login");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Invalid current password");
  }

  if (updateData.password) {
    const saltRound = 12;
    updateData.password = await bcrypt.hash(updateData.password, saltRound);
  }

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};
