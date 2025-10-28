import { LikeDto } from "./../dtos/like.dto";
import { LikeRepository } from "../repositories/like.repository";
import { Like } from "../interfaces/like.interface";

export class LikeService {
  private likeRepository = new LikeRepository();

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new Error(mensagem);
  }

  async adicionarLike(dto: LikeDto, userId: string): Promise<Like> {
    this.validarCampo(dto.tweetId, "O ID do tweet é obrigatório.");
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const like = await this.likeRepository.adicionarLike(dto, userId);

    return like;
  }

  async removerLike(tweetId: string, userId: string): Promise<void> {
    this.validarCampo(tweetId, "O ID do tweet é obrigatório.");
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    await this.likeRepository.removerLike(tweetId, userId);
  }
}
