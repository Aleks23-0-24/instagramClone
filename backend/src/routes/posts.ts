import { Router } from 'express';
import { createPost, getPosts, deletePost, getFeed, getPostsByUser } from '../controllers/posts';
import { toggleLike, createComment, getComments } from '../controllers/interactions';
import { authMiddleware } from '../middleware/auth';
import upload from '../config/cloudinary';

const router = Router();

router.get('/feed', authMiddleware, getFeed);
router.get('/user/:userId', getPostsByUser);
router.get('/', getPosts);
router.post('/', authMiddleware, upload.single('image'), createPost);
router.delete('/:postId', authMiddleware, deletePost);

// Likes
router.post('/:postId/like', authMiddleware, toggleLike);

// Comments
router.post('/:postId/comments', authMiddleware, createComment);
router.get('/:postId/comments', getComments);

export default router;