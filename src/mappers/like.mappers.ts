import {
  Like as PrismaLike,
  User as PrismaUser,
  Tweet as PrismaTweet,
} from "@prisma/client";
import { Like } from "../interfaces/like.interface";
import { mapUser } from "./user.mapper";
import { mapTweet } from "./tweet.mapper";

type LikeComRelacoes = PrismaLike & {
  user?: PrismaUser;
  tweet?: PrismaTweet & { user?: PrismaUser };
};

export function mapLike(like: LikeComRelacoes, shallow = false): Like {
  return {
    userId: like.userId,
    tweetId: like.tweetId,
    createdAt: like.createdAt,
    updatedAt: like.updatedAt,

    user: shallow
      ? undefined
      : like.user
      ? mapUser(like.user, true)
      : undefined,
    tweet: shallow
      ? undefined
      : like.tweet
      ? mapTweet(like.tweet, 1)
      : undefined,
  };
}
