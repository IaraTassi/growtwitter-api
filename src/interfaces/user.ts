import { Follow, Like, Tweet } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  imageUrl?: string;

  tweets?: Tweet[];
  likes?: Like[];
  followers?: Follow[];
  following?: Follow[];

  createdAt: Date;
  updatedAt: Date;
}
