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

export function mapTweet(tweet: TweetComRelacoes): Tweet {
  return {
    id: tweet.id,
    content: tweet.content,
    parentId: tweet.parentId ?? undefined,
    userId: tweet.userId,
    user: tweet.user ? mapUser(tweet.user) : undefined,
    likes: tweet.likes?.map(mapLike),
    replies: tweet.replies?.map(mapTweet),
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,
  };
}
