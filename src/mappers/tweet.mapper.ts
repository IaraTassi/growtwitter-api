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

export function mapTweet(tweet: TweetComRelacoes, shallow = false): Tweet {
  return {
    id: tweet.id,
    content: tweet.content,
    parentId: tweet.parentId ?? undefined,
    userId: tweet.userId,
    createdAt: tweet.createdAt,
    updatedAt: tweet.updatedAt,

    user: tweet.user ? mapUser(tweet.user, true) : undefined,
    likes: shallow ? undefined : tweet.likes?.map((l) => mapLike(l, true)),
    replies: shallow ? undefined : tweet.replies?.map((r) => mapTweet(r, true)),
  };
}
