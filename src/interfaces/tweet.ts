import { Like } from "./like";
import { User } from "./user";

export interface Tweet {
  id: string;
  content: string;

  parentId?: string;
  replies?: Tweet[];

  userId: string;
  user?: User;

  likes?: Like[];
  createdAt: Date;
}
