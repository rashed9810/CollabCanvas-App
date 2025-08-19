"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide name, email, and password" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ message: "Please provide a valid email address" });
        }
        // Validate password length
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }
        // Validate name length
        if (name.trim().length < 2) {
            return res
                .status(400)
                .json({ message: "Name must be at least 2 characters long" });
        }
        // Check if user already exists (case-insensitive)
        const userExists = await User_1.default.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Create new user
        const user = await User_1.default.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
        });
        if (user) {
            // Generate token
            const token = (0, jwt_1.generateToken)(user._id);
            // Set HTTP-only cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            });
        }
        else {
            res.status(400).json({ message: "Failed to create user" });
        }
    }
    catch (error) {
        // Handle mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        // Handle duplicate key error (in case unique index fails)
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }
        next(error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        // Validate required fields
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide email and password" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ message: "Please provide a valid email address" });
        }
        // Find user by email (case-insensitive)
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Generate token
        const token = (0, jwt_1.generateToken)(user._id);
        // Set HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res, next) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id).select("-password");
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
