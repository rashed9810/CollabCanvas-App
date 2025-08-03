import express from "express";
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardById,
  updateWhiteboard,
  deleteWhiteboard,
  addCollaborator,
  removeCollaborator,
} from "../controllers/whiteboardController";
import { protect } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .post(asyncHandler(createWhiteboard))
  .get(asyncHandler(getWhiteboards));

router
  .route("/:id")
  .get(asyncHandler(getWhiteboardById))
  .put(asyncHandler(updateWhiteboard))
  .delete(asyncHandler(deleteWhiteboard));

router.route("/:id/collaborators").post(asyncHandler(addCollaborator));

router
  .route("/:id/collaborators/:userId")
  .delete(asyncHandler(removeCollaborator));

export default router;
