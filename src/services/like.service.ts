import { LikeDto } from "./../dtos/like.dto";
import { LikeRepository } from "../repositories/like.repository";
import { Like } from "../interfaces/like.interface";

export class LikeService {
  private likeRepository = new LikeRepository();

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new Error(mensagem);
  }

  async buscarLike(tweetId: string, userId: string): Promise<Like | null> {
    this.validarCampo(tweetId, "O ID do tweet é obrigatório.");
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    return this.likeRepository.buscarLike(tweetId, userId);
  }

  async adicionarLike(dto: LikeDto, userId: string): Promise<Like> {
    this.validarCampo(dto.tweetId, "O ID do tweet é obrigatório.");
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const likeExistente = await this.buscarLike(dto.tweetId, userId);
    if (likeExistente) throw new Error("Usuário já curtiu este tweet.");

    const like = await this.likeRepository.adicionarLike(dto, userId);
    return like;
  }

  async removerLike(tweetId: string, userId: string): Promise<void> {
    this.validarCampo(tweetId, "O ID do tweet é obrigatório.");
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const likeExistente = await this.buscarLike(tweetId, userId);
    if (!likeExistente) throw new Error("Like não encontrado para remoção.");

    await this.likeRepository.removerLike(tweetId, userId);
  }
}
