import { Tweet } from "./tweet";
import { User } from "./user";

export interface Like {
  userId: string;
  tweetId: string;

  user?: User;
  tweet?: Tweet;

  createdAt: Date;
  updatedAt: Date;
}
