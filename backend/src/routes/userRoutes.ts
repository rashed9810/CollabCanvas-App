import express, { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', (req: Request, res: Response) => registerUser(req, res));
router.post('/login', (req: Request, res: Response) => loginUser(req, res));

// Protected routes
router.post('/logout', protect, (req: Request, res: Response, next: NextFunction) => logoutUser(req, res, next));
router.get('/profile', protect, (req: Request, res: Response, next: NextFunction) => getUserProfile(req, res, next));

export default router;
