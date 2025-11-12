import { CreateTweetDto } from "../dtos/create.tweet.dto";
import { Tweet } from "../interfaces/tweet.interface";
import { TweetRepository } from "../repositories/tweet.repository";
import { AppError } from "../errors/app.error";

export class TweetService {
  private tweetRepository = new TweetRepository();

  public setRepositoryParaTestes(repo: TweetRepository): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "setRepositoryParaTestes só pode ser usado em ambiente de teste."
      );
    }
    this.tweetRepository = repo;
  }

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new AppError(mensagem, 400);
  }

  async criarTweet(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.content, "O conteúdo do tweet é obrigatório.");

    if (dto.content.trim().length === 0)
      throw new AppError("O tweet não pode estar vazio.", 400);

    const tweet = await this.tweetRepository.criarTweet(dto, userId);

    return tweet;
  }

  async criarReply(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.content, "O conteúdo da resposta é obrigatório.");
    this.validarCampo(dto.parentId, "O ID do tweet original é obrigatório.");

    if (dto.content.trim().length === 0) {
      throw new AppError("O conteúdo da resposta não pode estar vazio.", 400);
    }

    const feed = (await this.tweetRepository.buscarFeedUsuario(userId)) || [];
    const tweetOriginal = feed.find((tweet) => tweet.id === dto.parentId);

    if (!tweetOriginal) {
      throw new AppError(
        "O tweet original não foi encontrado no seu feed.",
        404
      );
    }

    const reply = await this.tweetRepository.criarReply(dto, userId);
    return reply;
  }

  async buscarFeedUsuario(userId: string): Promise<Tweet[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const tweets = await this.tweetRepository.buscarFeedUsuario(userId);

    return tweets ?? [];
  }
}
