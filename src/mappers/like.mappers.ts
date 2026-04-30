import { Like as PrismaLike, User as PrismaUser } from "@prisma/client";
import { Like } from "../interfaces/like.interface";
import { mapUser } from "./user.mapper";

type LikeComRelacoes = PrismaLike & {
  user?: PrismaUser;
  tweet?: {
    id: string;
    content: string;
    userId: string;
  };
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
        ? {
            id: like.tweet.id,
            content: like.tweet.content,
            userId: like.tweet.userId,
          }
        : undefined,
  };
}
