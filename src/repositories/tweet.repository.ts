import { prisma } from "../config/prisma.config";
import { CreateTweetDto } from "../dtos/create.tweet.dto";
import { Tweet } from "../interfaces/tweet.interface";
import { mapTweet } from "../mappers/tweet.mapper";

export class TweetRepository {
  async criarTweet(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    const tweet = await prisma.tweet.create({
      data: { content: dto.content, parentId: dto.parentId, userId },
      include: {
        user: true,
        likes: { include: { user: true, tweet: true } },
        replies: {
          include: {
            user: true,
            likes: { include: { user: true } },
            replies: true,
          },
        },
      },
    });

    return mapTweet(tweet);
  }

  async criarReply(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    return this.criarTweet(dto, userId);
  }

  async buscarFeedUsuario(userId: string): Promise<Tweet[]> {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const tweets = await prisma.tweet.findMany({
      where: { userId: { in: [userId, ...followingIds] } },
      include: {
        user: true,
        likes: { include: { user: true, tweet: true } },
        replies: {
          include: {
            user: true,
            likes: { include: { user: true } },
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tweets.map((t) => mapTweet(t));
  }
}
