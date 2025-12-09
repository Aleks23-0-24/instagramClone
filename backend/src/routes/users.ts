import { Router } from 'express';
import { updateAvatar, getUser } from '../controllers/users';
import { authMiddleware } from '../middleware/auth';
import upload from '../config/cloudinary';

const router = Router();

// Public: get basic user info
router.get('/:id', getUser);

// Authenticated: update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

export default router;
