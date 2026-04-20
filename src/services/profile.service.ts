import { ProfileTweetResponseDto } from "../dtos/profile.tweet.response.dto";
import { AppError } from "../errors/app.error";
import { mapProfileTweetResponse } from "../mappers/profile.tweet.response.mapper";
import { ProfileRepository } from "../repositories/profile.repository";
import { UserRepository } from "../repositories/user.repository";

export class ProfileService {
  private profileRepository = new ProfileRepository();
  private userRepository = new UserRepository();

  private validarCampo(valor: string, mensagem: string) {
    if (!valor) {
      throw new AppError(mensagem, 400);
    }
  }

  private async validarUsuarioExistente(userId: string) {
    const user = await this.userRepository.buscarPorId(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }
  }

  async getProfileTweets(
    userId: string,
    loggedUserId: string,
  ): Promise<ProfileTweetResponseDto[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    await this.validarUsuarioExistente(userId);

    const tweets = await this.profileRepository.findProfileTweets(
      userId,
      loggedUserId,
    );

    return tweets.map(mapProfileTweetResponse);
  }

  async getProfileReplies(
    userId: string,
    loggedUserId: string,
  ): Promise<ProfileTweetResponseDto[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    await this.validarUsuarioExistente(userId);

    const replies = await this.profileRepository.findProfileReplies(
      userId,
      loggedUserId,
    );

    return replies.map(mapProfileTweetResponse);
  }

  async getProfileLikes(
    userId: string,
    loggedUserId: string,
  ): Promise<ProfileTweetResponseDto[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    await this.validarUsuarioExistente(userId);

    const likes = await this.profileRepository.findProfileLikes(
      userId,
      loggedUserId,
    );

    return likes.map(mapProfileTweetResponse);
  }
}
