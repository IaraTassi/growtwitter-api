import { Like } from "./like.interface";
import { User } from "./user.interface";

export interface Tweet {
  id: string;
  content: string;

  parentId?: string;
  replies?: Tweet[];

  userId: string;
  user?: User;

  likes?: Like[];
  createdAt: Date;
  updatedAt: Date;
}
