import { User } from "./user.interface";

export interface Follow {
  followerId: string;
  followingId: string;

  follower?: User;
  following?: User;

  createdAt: Date;
}
