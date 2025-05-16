import express from 'express';
import {
  createWhiteboard,
  getWhiteboards,
  getWhiteboardById,
  updateWhiteboard,
  deleteWhiteboard,
  addCollaborator,
  removeCollaborator,
} from '../controllers/whiteboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createWhiteboard)
  .get(getWhiteboards);

router.route('/:id')
  .get(getWhiteboardById)
  .put(updateWhiteboard)
  .delete(deleteWhiteboard);

router.route('/:id/collaborators')
  .post(addCollaborator);

router.route('/:id/collaborators/:userId')
  .delete(removeCollaborator);

export default router;
