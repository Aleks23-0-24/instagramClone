import { Router } from 'express';
import { getUsers, getMessages, createMessage } from '../controllers/chat';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// List users (public)
router.get('/users', getUsers);

// Messages between authenticated user and :userId
router.get('/:userId/messages', authMiddleware, getMessages);
router.post('/:userId/messages', authMiddleware, createMessage);

export default router;
