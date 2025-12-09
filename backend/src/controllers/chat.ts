import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true, avatarUrl: true } });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const otherId = req.params.userId;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'User not authenticated' });

  try {
    // Use raw SQL to avoid relying on generated Prisma client for new models
    const rows: any[] = await prisma.$queryRaw`
      SELECT m.*, u.id as sender_id, u.username as sender_username, u."avatarUrl" as sender_avatar
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE (m."senderId" = ${userId} AND m."receiverId" = ${otherId})
         OR (m."senderId" = ${otherId} AND m."receiverId" = ${userId})
      ORDER BY m."createdAt" ASC
    `;

    const messages = rows.map(r => ({
      id: r.id,
      senderId: r.senderId,
      receiverId: r.receiverId,
      content: r.content,
      createdAt: r.createdAt,
      sender: { id: r.sender_id, username: r.sender_username, avatarUrl: r.sender_avatar },
    }));

    res.json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  const otherId = req.params.userId;
  const userId = req.userId;
  const { content } = req.body;

  if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  if (!content) return res.status(400).json({ error: 'Message content required' });

  try {
    // Generate an id on the application side to avoid DB default issues
    const generatedId = `msg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

    const inserted: any = await prisma.$queryRaw`
      INSERT INTO "Message" (id, "senderId","receiverId","content","createdAt")
      VALUES (${generatedId}, ${userId}, ${otherId}, ${content}, now())
      RETURNING *
    `;

    const row = Array.isArray(inserted) ? inserted[0] : inserted;
    const sender = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, avatarUrl: true } });

    res.status(201).json({
      id: row.id,
      senderId: row.senderId,
      receiverId: row.receiverId,
      content: row.content,
      createdAt: row.createdAt,
      sender,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create message' });
  }
};
