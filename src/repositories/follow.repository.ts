import { prisma } from "../config/prisma.config";
import { Follow } from "../interfaces/follow.interface";
import { mapFollow } from "../mappers/follow.mapper";

export class FollowRepository {
  async seguirUsuario(
    followerId: string,
    followingId: string
  ): Promise<Follow> {
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        follower: true,
        following: true,
      },
    });

    return mapFollow(follow);
  }

  async deixarDeSeguirUsuario(
    followerId: string,
    followingId: string
  ): Promise<void> {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async buscarFollow(
    followerId: string,
    followingId: string
  ): Promise<Follow | null> {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      include: {
        follower: true,
        following: true,
      },
    });

    return follow ? mapFollow(follow) : null;
  }
}
