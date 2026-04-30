import {
  Tweet as PrismaTweet,
  User as PrismaUser,
  Like as PrismaLike,
} from "@prisma/client";
import { Tweet } from "../interfaces/tweet.interface";
import { mapUser } from "./user.mapper";
import { mapLike } from "./like.mappers";

type TweetComRelacoes = PrismaTweet & {
  user?: PrismaUser;
  likes?: (PrismaLike & { user?: PrismaUser })[];
  replies?: TweetComRelacoes[];
  _count?: {
    likes: number;
    replies: number;
  };
};

export function mapTweet(tweet: TweetComRelacoes): Tweet {
  return {
    id: tweet.id,
    content: tweet.content,
    parentId: tweet.parentId ?? undefined,
    userId: tweet.userId,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,

    user: tweet.user ? mapUser(tweet.user, true) : undefined,
    likes: tweet.likes?.map((l) => mapLike(l, true)) ?? [],

    replies: tweet.replies?.map(mapTweet) ?? [],
    likesCount: tweet._count?.likes ?? 0,
    repliesCount: tweet._count?.replies ?? 0,
  };
}
