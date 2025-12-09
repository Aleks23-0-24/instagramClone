import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const toggleLike = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      res.json({ message: 'Post unliked' });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      res.json({ message: 'Post liked' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
