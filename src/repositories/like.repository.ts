import { prisma } from "../config/prisma.config";
import { LikeDto } from "../dtos/like.dto";
import { Like } from "../interfaces/like.interface";
import { mapLike } from "../mappers/like.mappers";

export class LikeRepository {
  async adicionarLike(dto: LikeDto, userId: string): Promise<Like> {
    const like = await prisma.like.create({
      data: {
        userId,
        tweetId: dto.tweetId,
      },
      include: {
        user: true,
        tweet: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
                tweet: true,
              },
            },
            replies: true,
          },
        },
      },
    });

    return mapLike(like);
  }

  async removerLike(tweetId: string, userId: string): Promise<void> {
    await prisma.like.delete({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
    });
  }

  async buscarLike(tweetId: string, userId: string): Promise<Like | null> {
    const like = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
      include: {
        user: true,
        tweet: true,
      },
    });

    return like ? mapLike(like) : null;
  }
}
