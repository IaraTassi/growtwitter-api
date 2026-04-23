export interface ProfileReplyThreadDto {
  id: string;
  content: string;
  createdAt: Date;

  user: {
    id: string;
    name: string;
    userName: string;
    imageUrl?: string;
  };

  replies: ProfileReplyThreadDto[];
}
