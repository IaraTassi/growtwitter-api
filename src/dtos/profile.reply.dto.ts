export interface ProfileReplyThreadDto {
  id: string;
  content: string;
  createdAt: Date;

  user: {
    name: string;
    userName: string;
    imageUrl?: string;
  };

  replies: ProfileReplyThreadDto[];
}
