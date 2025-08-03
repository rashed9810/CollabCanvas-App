import { Request, Response, NextFunction } from "express";
import Whiteboard from "../models/Whiteboard";

// @desc    Create a new whiteboard
// @route   POST /api/whiteboards
// @access  Private
export const createWhiteboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, isPublic } = req.body;

  try {
    const whiteboard = await Whiteboard.create({
      name,
      owner: req.user._id,
      isPublic: isPublic || false,
    });

    res.status(201).json(whiteboard);
  } catch (error) {
    next(error);
  }
};

// Rate limiting tracking
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();

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
export const getWhiteboards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const whiteboards = await Whiteboard.find({
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
  } catch (error) {
    console.error("Error fetching whiteboards:", error);
    next(error);
  }
};

// @desc    Get whiteboard by ID
// @route   GET /api/whiteboards/:id
// @access  Private
export const getWhiteboardById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    // Check if user has access to this whiteboard
    const isOwner = whiteboard.owner._id.toString() === req.user._id.toString();
    const isCollaborator = whiteboard.collaborators.some(
      (collab: any) => collab._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this whiteboard" });
    }

    res.json(whiteboard);
  } catch (error) {
    next(error);
  }
};

// @desc    Update whiteboard
// @route   PUT /api/whiteboards/:id
// @access  Private
export const updateWhiteboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, canvasData, isPublic } = req.body;

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

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
    if (name) whiteboard.name = name;
    if (canvasData) whiteboard.canvasData = canvasData;
    if (isPublic !== undefined) whiteboard.isPublic = isPublic;

    const updatedWhiteboard = await whiteboard.save();
    res.json(updatedWhiteboard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete whiteboard
// @route   DELETE /api/whiteboards/:id
// @access  Private
export const deleteWhiteboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    // Check if user is the owner
    if (whiteboard.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this whiteboard" });
    }

    await Whiteboard.deleteOne({ _id: req.params.id });
    res.json({ message: "Whiteboard removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add collaborator to whiteboard
// @route   POST /api/whiteboards/:id/collaborators
// @access  Private
export const addCollaborator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

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
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator from whiteboard
// @route   DELETE /api/whiteboards/:id/collaborators/:userId
// @access  Private
export const removeCollaborator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

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
    whiteboard.collaborators = whiteboard.collaborators.filter(
      (id) => id.toString() !== req.params.userId
    );

    await whiteboard.save();
    res.json(whiteboard);
  } catch (error) {
    next(error);
  }
};
