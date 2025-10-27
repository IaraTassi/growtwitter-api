import { Follow as PrismaFollow, User as PrismaUser } from "@prisma/client";
import { Follow } from "../interfaces/follow.interface";
import { mapUser } from "./user.mapper";

type FollowComRelacoes = PrismaFollow & {
  follower?: PrismaUser;
  following?: PrismaUser;
};

export function mapFollow(follow: FollowComRelacoes): Follow {
  return {
    followerId: follow.followerId,
    followingId: follow.followingId,
    createdAt: follow.createdAt,
    follower: follow.follower ? mapUser(follow.follower) : undefined,
    following: follow.following ? mapUser(follow.following) : undefined,
  };
}
