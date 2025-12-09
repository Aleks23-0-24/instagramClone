import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  if (!req.file) return res.status(400).json({ error: 'Avatar file is required' });

  const avatarUrl = req.file.path;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, username: true, avatarUrl: true },
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};

export const getUser = async (req: any, res: Response) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, avatarUrl: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
