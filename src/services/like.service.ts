import { LikeDto } from "./../dtos/like.dto";
import { LikeRepository } from "../repositories/like.repository";
import { Like } from "../interfaces/like.interface";
import { AppError } from "../errors/app.error";
import { TweetRepository } from "../repositories/tweet.repository";
import { UserRepository } from "../repositories/user.repository";

export class LikeService {
  private likeRepository = new LikeRepository();
  private tweetRepository = new TweetRepository();
  private userRepository = new UserRepository();

  public setRepositoryParaTestes(
    likeRepo: LikeRepository,
    tweetRepo: TweetRepository,
    userRepo: UserRepository
  ): void {
    if (process.env.NODE_ENV !== "test")
      throw new Error(
        "setRepositoryParaTestes só pode ser usado em ambiente de teste."
      );
    this.likeRepository = likeRepo;
    this.tweetRepository = tweetRepo;
    this.userRepository = userRepo;
  }

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new AppError(mensagem, 400);
  }

  private async validarUsuarioExistente(userId: string) {
    const user = await this.userRepository.buscarPorId(userId);
    if (!user) throw new AppError("Usuário não encontrado.", 404);
  }

  private async validarTweetExistente(tweetId: string) {
    const tweet = await this.tweetRepository.buscarPorId(tweetId);
    if (!tweet) throw new AppError("Tweet não encontrado.", 404);
    return tweet;
  }

  async adicionarLike(dto: LikeDto, userId: string): Promise<Like> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.tweetId, "O ID do tweet é obrigatório.");

    await this.validarUsuarioExistente(userId);
    const tweet = await this.validarTweetExistente(dto.tweetId);

    if (tweet.userId === userId) {
      throw new AppError("Usuário não pode curtir o próprio tweet.", 409);
    }

    const likeExistente = await this.likeRepository.buscarLike(
      dto.tweetId,
      userId
    );
    if (likeExistente) {
      throw new AppError("Usuário já curtiu este tweet.", 409);
    }

    return this.likeRepository.adicionarLike(dto, userId);
  }

  async buscarLike(tweetId: string, userId: string): Promise<Like | null> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(tweetId, "O ID do tweet é obrigatório.");

    await this.validarUsuarioExistente(userId);
    await this.validarTweetExistente(tweetId);

    return this.likeRepository.buscarLike(tweetId, userId);
  }

  async removerLike(tweetId: string, userId: string): Promise<void> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(tweetId, "O ID do tweet é obrigatório.");

    await this.validarUsuarioExistente(userId);
    await this.validarTweetExistente(tweetId);

    const likeExistente = await this.likeRepository.buscarLike(tweetId, userId);
    if (!likeExistente) throw new AppError("Like não encontrado.", 404);

    await this.likeRepository.removerLike(tweetId, userId);
  }
}
