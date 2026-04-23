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

  async findById(id: string) {
    return prisma.tweet.findUnique({
      where: { id },
      select: {
        id: true,
        parentId: true,
      },
    });
  }

  async findUserParticipations(userId: string) {
    return prisma.tweet.findMany({
      where: { userId },
      select: {
        id: true,
        parentId: true,
      },
    });
  }

  async findAllTweetsBasic() {
    return prisma.tweet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
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
