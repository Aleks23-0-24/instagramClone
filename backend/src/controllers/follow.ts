import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const toggleFollow = async (req: AuthRequest, res: Response) => {
    const { id: followingId } = req.params;
    const followerId = req.userId;

    console.log('toggleFollow: followerId:', followerId, 'followingId:', followingId);

    if (!followerId) {
        console.log('toggleFollow: User not authenticated');
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        console.log('toggleFollow: existingFollow:', existingFollow);

        if (existingFollow) {
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            console.log('toggleFollow: User unfollowed');
            res.json({ message: 'User unfollowed' });
        } else {
            await prisma.follows.create({
                data: {
                    followerId,
                    followingId,
                },
            });
            console.log('toggleFollow: User followed');
            res.json({ message: 'User followed' });
        }
    } catch (error) {
        console.error('toggleFollow: error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getFollowers = async (req: AuthRequest, res: Response) => {
    const { id: userId } = req.params;

    try {
        const followers = await prisma.follows.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
        res.json(followers.map(f => f.follower));
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
    const { id: userId } = req.params;

    try {
        const following = await prisma.follows.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: { id: true, username: true, avatarUrl: true },
                },
            },
        });
        res.json(following.map(f => f.following));
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};
