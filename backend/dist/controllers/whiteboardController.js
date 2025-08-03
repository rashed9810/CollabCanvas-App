"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCollaborator = exports.addCollaborator = exports.deleteWhiteboard = exports.updateWhiteboard = exports.getWhiteboardById = exports.getWhiteboards = exports.createWhiteboard = void 0;
const Whiteboard_1 = __importDefault(require("../models/Whiteboard"));
// @desc    Create a new whiteboard
// @route   POST /api/whiteboards
// @access  Private
const createWhiteboard = async (req, res, next) => {
    const { name, isPublic } = req.body;
    try {
        const whiteboard = await Whiteboard_1.default.create({
            name,
            owner: req.user._id,
            isPublic: isPublic || false,
        });
        res.status(201).json(whiteboard);
    }
    catch (error) {
        next(error);
    }
};
exports.createWhiteboard = createWhiteboard;
// Rate limiting tracking
const rateLimitMap = new Map();
// Cleanup old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.lastRequest > windowMs) {
            rateLimitMap.delete(key);
        }
    }
}, 30000); // Run cleanup every 30 seconds
// @desc    Get all whiteboards for a user
// @route   GET /api/whiteboards
// @access  Private
const getWhiteboards = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const now = Date.now();
        const windowMs = 60000; // 1 minute window
        const maxRequests = 10; // Max 10 requests per minute
        // Get or initialize rate limit data for user
        let rateData = rateLimitMap.get(userId);
        if (!rateData) {
            rateData = { count: 0, lastRequest: 0 };
        }
        // Reset count if window has passed
        if (now - rateData.lastRequest > windowMs) {
            rateData.count = 0;
        }
        // Check rate limit
        if (rateData.count >= maxRequests) {
            console.warn(`Rate limit exceeded for user: ${userId}`);
            return res
                .status(429)
                .json({ message: "Too many requests, please try again later" });
        }
        // Update rate limit data
        rateData.count++;
        rateData.lastRequest = now;
        rateLimitMap.set(userId, rateData);
        console.log(`Fetching whiteboards for user: ${userId}`);
        // Find whiteboards where user is owner or collaborator
        const whiteboards = await Whiteboard_1.default.find({
            $or: [
                { owner: req.user._id },
                { collaborators: req.user._id },
                { isPublic: true },
            ],
        }).sort({ updatedAt: -1 });
        console.log(`Found ${whiteboards.length} whiteboards for user: ${userId}`);
        // Add cache headers to prevent excessive requests
        res.set({
            "Cache-Control": "private, max-age=30", // Cache for 30 seconds
            Expires: new Date(Date.now() + 30000).toUTCString(),
        });
        res.json(whiteboards);
    }
    catch (error) {
        console.error("Error fetching whiteboards:", error);
        next(error);
    }
};
exports.getWhiteboards = getWhiteboards;
// @desc    Get whiteboard by ID
// @route   GET /api/whiteboards/:id
// @access  Private
const getWhiteboardById = async (req, res, next) => {
    try {
        const whiteboard = await Whiteboard_1.default.findById(req.params.id)
            .populate("owner", "name email")
            .populate("collaborators", "name email");
        if (!whiteboard) {
            return res.status(404).json({ message: "Whiteboard not found" });
        }
        // Check if user has access to this whiteboard
        const isOwner = whiteboard.owner._id.toString() === req.user._id.toString();
        const isCollaborator = whiteboard.collaborators.some((collab) => collab._id.toString() === req.user._id.toString());
        if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
            return res
                .status(403)
                .json({ message: "Not authorized to access this whiteboard" });
        }
        res.json(whiteboard);
    }
    catch (error) {
        next(error);
    }
};
exports.getWhiteboardById = getWhiteboardById;
// @desc    Update whiteboard
// @route   PUT /api/whiteboards/:id
// @access  Private
const updateWhiteboard = async (req, res, next) => {
    const { name, canvasData, isPublic } = req.body;
    try {
        const whiteboard = await Whiteboard_1.default.findById(req.params.id);
        if (!whiteboard) {
            return res.status(404).json({ message: "Whiteboard not found" });
        }
        // Check if user is the owner
        if (whiteboard.owner.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this whiteboard" });
        }
        // Update fields
        if (name)
            whiteboard.name = name;
        if (canvasData)
            whiteboard.canvasData = canvasData;
        if (isPublic !== undefined)
            whiteboard.isPublic = isPublic;
        const updatedWhiteboard = await whiteboard.save();
        res.json(updatedWhiteboard);
    }
    catch (error) {
        next(error);
    }
};
exports.updateWhiteboard = updateWhiteboard;
// @desc    Delete whiteboard
// @route   DELETE /api/whiteboards/:id
// @access  Private
const deleteWhiteboard = async (req, res, next) => {
    try {
        const whiteboard = await Whiteboard_1.default.findById(req.params.id);
        if (!whiteboard) {
            return res.status(404).json({ message: "Whiteboard not found" });
        }
        // Check if user is the owner
        if (whiteboard.owner.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this whiteboard" });
        }
        await Whiteboard_1.default.deleteOne({ _id: req.params.id });
        res.json({ message: "Whiteboard removed" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWhiteboard = deleteWhiteboard;
// @desc    Add collaborator to whiteboard
// @route   POST /api/whiteboards/:id/collaborators
// @access  Private
const addCollaborator = async (req, res, next) => {
    const { userId } = req.body;
    try {
        const whiteboard = await Whiteboard_1.default.findById(req.params.id);
        if (!whiteboard) {
            return res.status(404).json({ message: "Whiteboard not found" });
        }
        // Check if user is the owner
        if (whiteboard.owner.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to add collaborators" });
        }
        // Check if user is already a collaborator
        if (whiteboard.collaborators.includes(userId)) {
            return res
                .status(400)
                .json({ message: "User is already a collaborator" });
        }
        whiteboard.collaborators.push(userId);
        await whiteboard.save();
        res.json(whiteboard);
    }
    catch (error) {
        next(error);
    }
};
exports.addCollaborator = addCollaborator;
// @desc    Remove collaborator from whiteboard
// @route   DELETE /api/whiteboards/:id/collaborators/:userId
// @access  Private
const removeCollaborator = async (req, res, next) => {
    try {
        const whiteboard = await Whiteboard_1.default.findById(req.params.id);
        if (!whiteboard) {
            return res.status(404).json({ message: "Whiteboard not found" });
        }
        // Check if user is the owner
        if (whiteboard.owner.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to remove collaborators" });
        }
        // Remove collaborator
        whiteboard.collaborators = whiteboard.collaborators.filter((id) => id.toString() !== req.params.userId);
        await whiteboard.save();
        res.json(whiteboard);
    }
    catch (error) {
        next(error);
    }
};
exports.removeCollaborator = removeCollaborator;
