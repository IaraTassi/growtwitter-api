import { Tweet } from "./tweet.interface";
import { User } from "./user.interface";

export interface Like {
  userId: string;
  tweetId: string;

  user?: User;
  tweet?: Tweet;

  createdAt: Date;
  updatedAt: Date;
}
