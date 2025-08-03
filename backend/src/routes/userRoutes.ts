import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
} from "../controllers/userController";
import { protect } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// Public routes
router.post("/", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));

// Protected routes
router.post("/logout", protect, asyncHandler(logoutUser));
router.get("/profile", protect, asyncHandler(getUserProfile));

export default router;
