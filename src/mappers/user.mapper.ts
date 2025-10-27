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
};

export function mapUser(user: UsuarioComRelacoes): User {
  return {
    id: user.id,
    name: user.name,
    userName: user.userName,
    email: user.email,
    password: user.password,
    imageUrl: user.imageUrl ?? null,
    tweets: user.tweets?.map(mapTweet),
    likes: user.likes?.map(mapLike),
    followers: user.followers?.map(mapFollow),
    following: user.following?.map(mapFollow),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
