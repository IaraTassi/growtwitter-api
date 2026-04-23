import { ProfileReplyThreadDto } from "../dtos/profile.reply.dto";

export function mapTweetToThreadDto(node: any): ProfileReplyThreadDto {
  return {
    id: node.id,
    content: node.content,
    createdAt: node.createdAt,
    user: {
      name: node.user.name,
      userName: node.user.userName,
      imageUrl: node.user.imageUrl,
    },
    replies: node.replies.map((r: any) => mapTweetToThreadDto(r)),
  };
}
