import {
  User as PrismaUser,
  Tweet as PrismaTweet,
  Like as PrismaLike,
  Follow as PrismaFollow,
} from "@prisma/client";
import { User } from "../interfaces/user.interface";
import { mapTweet } from "./tweet.mapper";
import { mapLike } from "./like.mappers";
import { mapFollow } from "./follow.mapper";

type UsuarioComRelacoes = PrismaUser & {
  tweets?: PrismaTweet[];
  likes?: PrismaLike[];
  followers?: PrismaFollow[];
  following?: PrismaFollow[];
  _count?: {
    tweets: number;
    followers: number;
    following: number;
  };
};

export function mapUser(user: UsuarioComRelacoes, shallow = false): User {
  return {
    id: user.id,
    name: user.name,
    userName: user.userName,
    email: user.email,
    password: shallow ? undefined : user.password,
    imageUrl: user.imageUrl ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,

    tweets: shallow
      ? undefined
      : user.tweets?.map((t) =>
          mapTweet({
            ...t,
            replies: [],
            likes: [],
            _count: {
              likes: 0,
              replies: 0,
            },
          }),
        ),
    likes: shallow ? undefined : user.likes?.map((l) => mapLike(l, true)),
    followers: shallow
      ? undefined
      : user.followers?.map((f) => mapFollow(f, true)),
    following: shallow
      ? undefined
      : user.following?.map((f) => mapFollow(f, true)),

    tweetsCount: user._count?.tweets ?? 0,
    followersCount: user._count?.followers ?? 0,
    followingCount: user._count?.following ?? 0,
  };
}
