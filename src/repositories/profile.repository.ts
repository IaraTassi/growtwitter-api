import { prisma } from "../config/prisma.config";

export class ProfileRepository {
  async findProfileTweets(userId: string, loggedUserId: string) {
    return prisma.tweet.findMany({
      where: {
        userId,
        parentId: null,
      },
      include: {
        user: true,
        parent: {
          include: { user: true },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { userId: loggedUserId },
          select: { userId: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findProfileReplies(userId: string, loggedUserId: string) {
    return prisma.tweet.findMany({
      where: {
        userId,
        parentId: { not: null },
      },
      include: {
        user: true,
        parent: {
          include: { user: true },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { userId: loggedUserId },
          select: { userId: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findProfileLikes(userId: string, loggedUserId: string) {
    return prisma.tweet.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        user: true,
        parent: {
          include: { user: true },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        likes: {
          where: { userId: loggedUserId },
          select: { userId: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
