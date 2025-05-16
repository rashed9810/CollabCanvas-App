import jwt from "jsonwebtoken";
import { Types } from "mongoose";

// Generate JWT token
export const generateToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
  } catch (error) {
    throw new Error("Invalid token");
  }
};
