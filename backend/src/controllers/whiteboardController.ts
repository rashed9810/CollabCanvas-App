import { Request, Response } from 'express';
import Whiteboard from '../models/Whiteboard';

// @desc    Create a new whiteboard
// @route   POST /api/whiteboards
// @access  Private
export const createWhiteboard = async (req: Request, res: Response) => {
  const { name, isPublic } = req.body;

  try {
    const whiteboard = await Whiteboard.create({
      name,
      owner: req.user._id,
      isPublic: isPublic || false,
    });

    res.status(201).json(whiteboard);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all whiteboards for a user
// @route   GET /api/whiteboards
// @access  Private
export const getWhiteboards = async (req: Request, res: Response) => {
  try {
    // Find whiteboards where user is owner or collaborator
    const whiteboards = await Whiteboard.find({
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id },
        { isPublic: true },
      ],
    }).sort({ updatedAt: -1 });

    res.json(whiteboards);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get whiteboard by ID
// @route   GET /api/whiteboards/:id
// @access  Private
export const getWhiteboardById = async (req: Request, res: Response) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user has access to this whiteboard
    const isOwner = whiteboard.owner._id.toString() === req.user._id.toString();
    const isCollaborator = whiteboard.collaborators.some(
      (collab: any) => collab._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this whiteboard' });
    }

    res.json(whiteboard);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update whiteboard
// @route   PUT /api/whiteboards/:id
// @access  Private
export const updateWhiteboard = async (req: Request, res: Response) => {
  const { name, canvasData, isPublic } = req.body;

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is the owner
    if (whiteboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this whiteboard' });
    }

    // Update fields
    if (name) whiteboard.name = name;
    if (canvasData) whiteboard.canvasData = canvasData;
    if (isPublic !== undefined) whiteboard.isPublic = isPublic;

    const updatedWhiteboard = await whiteboard.save();
    res.json(updatedWhiteboard);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete whiteboard
// @route   DELETE /api/whiteboards/:id
// @access  Private
export const deleteWhiteboard = async (req: Request, res: Response) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is the owner
    if (whiteboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this whiteboard' });
    }

    await Whiteboard.deleteOne({ _id: req.params.id });
    res.json({ message: 'Whiteboard removed' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add collaborator to whiteboard
// @route   POST /api/whiteboards/:id/collaborators
// @access  Private
export const addCollaborator = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is the owner
    if (whiteboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add collaborators' });
    }

    // Check if user is already a collaborator
    if (whiteboard.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    whiteboard.collaborators.push(userId);
    await whiteboard.save();

    res.json(whiteboard);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove collaborator from whiteboard
// @route   DELETE /api/whiteboards/:id/collaborators/:userId
// @access  Private
export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is the owner
    if (whiteboard.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove collaborators' });
    }

    // Remove collaborator
    whiteboard.collaborators = whiteboard.collaborators.filter(
      (id) => id.toString() !== req.params.userId
    );

    await whiteboard.save();
    res.json(whiteboard);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
