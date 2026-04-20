export interface ProfileTweetResponseDto {
  id: string;
  content: string;
  createdAt: Date;

  user: {
    id: string;
    name: string;
    userName: string;
    imageUrl?: string;
  };

  parent?: {
    id: string;
    userName: string;
  };

  likesCount: number;
  repliesCount: number;

  likedByMe: boolean;
}
