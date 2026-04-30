import { ProfileReplyThreadDto } from "../dtos/profile.reply.dto";
import { ProfileTweetResponseDto } from "../dtos/profile.tweet.response.dto";
import { AppError } from "../errors/app.error";
import { mapTweetToThreadDto } from "../mappers/profile.reply.mapper";
import { mapProfileTweetResponse } from "../mappers/profile.tweet.response.mapper";
import { ProfileRepository } from "../repositories/profile.repository";
import { UserRepository } from "../repositories/user.repository";
import { buildTweetTree, sortTweetTree } from "../utils/tweet.tree.util";

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

  private async findRoot(tweetId: string): Promise<string> {
    let current = await this.profileRepository.findById(tweetId);

    if (!current) {
      throw new Error("Tweet não encontrado ao buscar root");
    }

    while (current.parentId) {
      const parent = await this.profileRepository.findById(current.parentId);

      if (!parent) break;

      current = parent;
    }

    return current.id;
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

  async getProfileReplies(userId: string): Promise<ProfileReplyThreadDto[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    await this.validarUsuarioExistente(userId);

    const participations =
      await this.profileRepository.findUserParticipations(userId);

    if (!participations.length) return [];

    const rootIds = new Set<string>(
      (
        await Promise.all(participations.map((t) => this.findRoot(t.id)))
      ).filter(Boolean) as string[],
    );

    const allTweets = await this.profileRepository.findAllTweetsBasic();

    const tree = buildTweetTree(allTweets);

    const threads = tree.filter((root) => rootIds.has(root.id));

    threads.forEach(sortTweetTree);

    threads.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return threads.map(mapTweetToThreadDto);
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
