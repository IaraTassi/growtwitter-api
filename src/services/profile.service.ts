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

  private async getRootId(tweetId: string): Promise<string | null> {
    let current = await this.profileRepository.findTweetById(tweetId);

    while (current?.parentId) {
      current = await this.profileRepository.findTweetById(current.parentId);
    }

    return current?.id ?? null;
  }

  async getProfileReplies(
    userId: string,
    loggedUserId: string,
  ): Promise<ProfileTweetResponseDto[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    await this.validarUsuarioExistente(userId);

    const replies = await this.profileRepository.findUserRepliesIds(userId);

    const rootIds = new Set<string>();

    for (const reply of replies) {
      const rootId = await this.getRootId(reply.id);
      if (rootId) rootIds.add(rootId);
    }

    const conversations = await this.profileRepository.findConversations(
      Array.from(rootIds),
      loggedUserId,
    );

    return conversations.map(mapProfileTweetResponse);
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
