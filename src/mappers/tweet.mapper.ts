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
};

export function mapTweet(tweet: TweetComRelacoes, depth = 0): Tweet {
  return {
    id: tweet.id,
    content: tweet.content,
    parentId: tweet.parentId ?? undefined,
    userId: tweet.userId,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,

    user: tweet.user ? mapUser(tweet.user, true) : undefined,

    likes: tweet.likes?.map((l) => mapLike(l, true)),

    replies:
      depth < 2 ? tweet.replies?.map((r) => mapTweet(r, depth + 1)) : undefined,
  };
}
