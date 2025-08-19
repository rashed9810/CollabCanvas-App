import express from "express";
import {
  createPoll,
  castVote,
  getPollResults,
  getActivePolls,
  closePoll,
} from "../controllers/pollController";
import { protect } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// All routes are protected
router.use(protect);

// Poll routes
router.post("/create", asyncHandler(createPoll));
router.post("/vote", asyncHandler(castVote));
router.get("/:id/results", asyncHandler(getPollResults));
router.get("/whiteboard/:whiteboardId/active", asyncHandler(getActivePolls));
router.patch("/:id/close", asyncHandler(closePoll));

export default router;
