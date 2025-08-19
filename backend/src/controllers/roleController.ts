import { Request, Response, NextFunction } from "express";
import Whiteboard from "../models/Whiteboard";
import User from "../models/User";
import mongoose from "mongoose";

// Role permission mappings
const ROLE_PERMISSIONS = {
  viewer: {
    canDraw: false,
    canEdit: false,
    canManageUsers: false,
    canPresentMode: false,
  },
  editor: {
    canDraw: true,
    canEdit: true,
    canManageUsers: false,
    canPresentMode: false,
  },
  presenter: {
    canDraw: true,
    canEdit: true,
    canManageUsers: true,
    canPresentMode: true,
  },
};

// @desc    Assign role to collaborator
// @route   POST /api/whiteboards/:id/roles
// @access  Private (Owner or Presenter only)
export const assignRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, role } = req.body;
  const whiteboardId = req.params.id;

  try {
    // Validate required fields
    if (!userId || !role) {
      res.status(400).json({
        success: false,
        message: "Please provide userId and role",
      });
      return;
    }

    // Validate role
    if (!["viewer", "editor", "presenter"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be viewer, editor, or presenter",
      });
      return;
    }

    // Find whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }

    // Check if user has permission to assign roles
    const isOwner = whiteboard.owner.toString() === req.user._id.toString();
    const userCollaborator = whiteboard.collaborators.find(
      (collab) => collab.userId.toString() === req.user._id.toString()
    );
    const canManageUsers =
      userCollaborator?.permissions.canManageUsers || false;

    if (!isOwner && !canManageUsers) {
      res.status(403).json({
        success: false,
        message: "Not authorized to assign roles",
      });
      return;
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if user is already a collaborator
    const existingCollaboratorIndex = whiteboard.collaborators.findIndex(
      (collab) => collab.userId.toString() === userId
    );

    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];

    if (existingCollaboratorIndex !== -1) {
      // Update existing collaborator
      whiteboard.collaborators[existingCollaboratorIndex] = {
        userId: new mongoose.Types.ObjectId(userId),
        role: role as "viewer" | "editor" | "presenter",
        permissions,
        assignedAt: new Date(),
        assignedBy: req.user._id,
      };
    } else {
      // Add new collaborator
      whiteboard.collaborators.push({
        userId: new mongoose.Types.ObjectId(userId),
        role: role as "viewer" | "editor" | "presenter",
        permissions,
        assignedAt: new Date(),
        assignedBy: req.user._id,
      });
    }

    await whiteboard.save();

    // Populate user info for response
    await whiteboard.populate("collaborators.userId", "name email");

    res.json({
      success: true,
      message: "Role assigned successfully",
      collaborator: whiteboard.collaborators.find(
        (collab) => collab.userId.toString() === userId
      ),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator
// @route   DELETE /api/whiteboards/:id/roles/:userId
// @access  Private (Owner or Presenter only)
export const removeCollaborator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const whiteboardId = req.params.id;

  try {
    // Find whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }

    // Check if user has permission to remove collaborators
    const isOwner = whiteboard.owner.toString() === req.user._id.toString();
    const userCollaborator = whiteboard.collaborators.find(
      (collab) => collab.userId.toString() === req.user._id.toString()
    );
    const canManageUsers =
      userCollaborator?.permissions.canManageUsers || false;

    if (!isOwner && !canManageUsers) {
      res.status(403).json({
        success: false,
        message: "Not authorized to remove collaborators",
      });
      return;
    }

    // Cannot remove owner
    if (whiteboard.owner.toString() === userId) {
      res.status(400).json({
        success: false,
        message: "Cannot remove whiteboard owner",
      });
      return;
    }

    // Remove collaborator
    whiteboard.collaborators = whiteboard.collaborators.filter(
      (collab) => collab.userId.toString() !== userId
    );

    await whiteboard.save();

    res.json({
      success: true,
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get whiteboard roles
// @route   GET /api/whiteboards/:id/roles
// @access  Private
export const getWhiteboardRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators.userId", "name email")
      .populate("collaborators.assignedBy", "name email");

    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }
     
    // Check if user has access to view roles
    const isOwner = whiteboard.owner._id.toString() === req.user._id.toString();
    const isCollaborator = whiteboard.collaborators.some(
      (collab) => collab.userId._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
      res.status(403).json({
        success: false,
        message: "Not authorized to view whiteboard roles",
      });
      return;
    }

    res.json({
      success: true,
      owner: whiteboard.owner,
      collaborators: whiteboard.collaborators,
      presenterMode: whiteboard.presenterMode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start presenter mode
// @route   POST /api/whiteboards/:id/presenter-mode/start
// @access  Private (Presenter role only)
export const startPresenterMode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { viewState } = req.body;
  const whiteboardId = req.params.id;

  try {
    // Find whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }

    // Check if user has presenter permissions
    const isOwner = whiteboard.owner.toString() === req.user._id.toString();
    const userCollaborator = whiteboard.collaborators.find(
      (collab) => collab.userId.toString() === req.user._id.toString()
    );
    const canPresentMode =
      userCollaborator?.permissions.canPresentMode || isOwner;

    if (!canPresentMode) {
      res.status(403).json({
        success: false,
        message: "Not authorized to start presenter mode",
      });
      return;
    }

    // Check if presenter mode is already active
    if (whiteboard.presenterMode.isActive) {
      res.status(400).json({
        success: false,
        message: "Presenter mode is already active",
        currentPresenter: whiteboard.presenterMode.presenterId,
      });
      return;
    }

    // Start presenter mode
    whiteboard.presenterMode = {
      isActive: true,
      presenterId: req.user._id,
      viewState: viewState || {
        zoom: 1,
        panX: 0,
        panY: 0,
        viewport: { width: 1920, height: 1080 },
      },
      startedAt: new Date(),
    };

    await whiteboard.save();

    res.json({
      success: true,
      message: "Presenter mode started",
      presenterMode: whiteboard.presenterMode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End presenter mode
// @route   POST /api/whiteboards/:id/presenter-mode/end
// @access  Private (Current presenter or owner only)
export const endPresenterMode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const whiteboardId = req.params.id;

  try {
    // Find whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }

    // Check if presenter mode is active
    if (!whiteboard.presenterMode.isActive) {
      res.status(400).json({
        success: false,
        message: "Presenter mode is not active",
      });
      return;
    }

    // Check if user can end presenter mode
    const isOwner = whiteboard.owner.toString() === req.user._id.toString();
    const isCurrentPresenter =
      whiteboard.presenterMode.presenterId?.toString() ===
      req.user._id.toString();

    if (!isOwner && !isCurrentPresenter) {
      res.status(403).json({
        success: false,
        message: "Not authorized to end presenter mode",
      });
      return;
    }

    // End presenter mode
    whiteboard.presenterMode = {
      isActive: false,
    };

    await whiteboard.save();

    res.json({
      success: true,
      message: "Presenter mode ended",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update presenter view state
// @route   PUT /api/whiteboards/:id/presenter-mode/view
// @access  Private (Current presenter only)
export const updatePresenterView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { viewState } = req.body;
  const whiteboardId = req.params.id;

  try {
    // Find whiteboard
    const whiteboard = await Whiteboard.findById(whiteboardId);
    if (!whiteboard) {
      res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
      return;
    }

    // Check if presenter mode is active
    if (!whiteboard.presenterMode.isActive) {
      res.status(400).json({
        success: false,
        message: "Presenter mode is not active",
      });
      return;
    }

    // Check if user is the current presenter
    const isCurrentPresenter =
      whiteboard.presenterMode.presenterId?.toString() ===
      req.user._id.toString();

    if (!isCurrentPresenter) {
      res.status(403).json({
        success: false,
        message: "Only the current presenter can update view state",
      });
      return;
    }

    // Update view state
    if (whiteboard.presenterMode.viewState) {
      whiteboard.presenterMode.viewState = {
        ...whiteboard.presenterMode.viewState,
        ...viewState,
      };
    } else {
      whiteboard.presenterMode.viewState = viewState;
    }

    await whiteboard.save();

    res.json({
      success: true,
      message: "Presenter view state updated",
      viewState: whiteboard.presenterMode.viewState,
    });
  } catch (error) {
    next(error);
  }
};
