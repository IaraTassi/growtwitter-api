import { Follow as PrismaFollow, User as PrismaUser } from "@prisma/client";
import { Follow } from "../interfaces/follow.interface";
import { mapUser } from "./user.mapper";

type FollowComRelacoes = PrismaFollow & {
  follower?: PrismaUser;
  following?: PrismaUser;
};

export function mapFollow(follow: FollowComRelacoes, shallow = false): Follow {
  return {
    followerId: follow.followerId,
    followingId: follow.followingId,
    createdAt: follow.createdAt,

    follower: shallow
      ? undefined
      : follow.follower
      ? mapUser(follow.follower, true)
      : undefined,
    following: shallow
      ? undefined
      : follow.following
      ? mapUser(follow.following, true)
      : undefined,
  };
}