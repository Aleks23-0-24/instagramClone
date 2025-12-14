import { Router } from 'express';
import { updateAvatar, getUser } from '../controllers/users';
import * as followController from '../controllers/follow';
import { authMiddleware } from '../middleware/auth';
import upload from '../config/cloudinary';

const router = Router();

// Public: get basic user info
router.get('/:id', getUser);

// Authenticated: update avatar
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

// Follow/unfollow
router.post('/:id/follow', authMiddleware, followController.toggleFollow);

// Get followers/following
router.get('/:id/followers', followController.getFollowers);
router.get('/:id/following', followController.getFollowing);


export default router;
