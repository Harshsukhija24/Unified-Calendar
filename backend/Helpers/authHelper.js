import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Function to create JWT token
export const createAccToken = (userData) => {
  // Handle both formats: { userId } or { id }
  const userId = userData.id || userData.userId;

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
  return token;
};

// Function to verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

// Functions for password hashing and verification
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export const verifyPassword = (inputPassword, hashedPassword) => {
  const hashedInput = hashPassword(inputPassword);
  return hashedInput === hashedPassword;
};
