import { TweetPreview } from "./tweet.preview.interface";
import { User } from "./user.interface";

export interface Like {
  userId: string;
  tweetId: string;

  user?: User;
  tweet?: TweetPreview;

  createdAt: Date;
  updatedAt: Date;
}
