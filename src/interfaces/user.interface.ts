import { Tweet } from "./tweet.interface";
import { Like } from "./like.interface";
import { Follow } from "./follow.interface";

export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
  password: string;
  imageUrl?: string | null;

  tweets?: Tweet[];
  likes?: Like[];
  followers?: Follow[];
  following?: Follow[];

  createdAt: Date;
  updatedAt: Date;
}
