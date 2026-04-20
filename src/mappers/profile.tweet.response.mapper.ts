import { Prisma } from "@prisma/client";
import { ProfileTweetResponseDto } from "../dtos/profile.tweet.response.dto";

type ProfileTweetWithRelations = Prisma.TweetGetPayload<{
  include: {
    user: true;
    parent: {
      include: {
        user: true;
      };
    };
    _count: {
      select: {
        likes: true;
        replies: true;
      };
    };
    likes: {
      select: {
        userId: true;
      };
    };
  };
}>;

export function mapProfileTweetResponse(
  tweet: ProfileTweetWithRelations,
): ProfileTweetResponseDto {
  return {
    id: tweet.id,
    content: tweet.content,
    createdAt: tweet.createdAt,

    user: {
      id: tweet.user.id,
      name: tweet.user.name,
      userName: tweet.user.userName,
      imageUrl: tweet.user.imageUrl ?? undefined,
    },

    parent: tweet.parent
      ? {
          id: tweet.parent.id,
          userName: tweet.parent.user.userName,
        }
      : undefined,

    likesCount: tweet._count.likes,
    repliesCount: tweet._count.replies,

    likedByMe: tweet.likes.length > 0,
  };
}
