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

  async findTweetById(tweetId: string) {
    return prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { id: true, parentId: true },
    });
  }

  async findUserRepliesIds(userId: string) {
    return prisma.tweet.findMany({
      where: {
        userId,
        parentId: { not: null },
      },
      select: {
        id: true,
      },
    });
  }

  async findConversations(rootIds: string[], loggedUserId: string) {
    return prisma.tweet.findMany({
      where: {
        OR: [
          { id: { in: rootIds } },
          { parentId: { in: rootIds } },
          {
            parent: {
              parentId: { in: rootIds },
            },
          },
        ],
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
        createdAt: "asc",
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
