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

  private validarConteudo(
    content: string,
    tipo: "tweet" | "resposta" = "tweet"
  ) {
    if (content.trim().length === 0) {
      throw new AppError(
        tipo === "tweet"
          ? "O conteúdo do tweet não pode estar vazio."
          : "O conteúdo da resposta não pode estar vazio.",
        400
      );
    }

    if (content.length > 280) {
      throw new AppError(
        tipo === "tweet"
          ? "O tweet não pode ter mais de 280 caracteres."
          : "A resposta não pode ter mais de 280 caracteres.",
        400
      );
    }
  }

  async criarTweet(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.content, "O conteúdo do tweet é obrigatório.");
    this.validarConteudo(dto.content);

    return this.tweetRepository.criarTweet(dto, userId);
  }

  async buscarPorId(id: string): Promise<Tweet> {
    this.validarCampo(id, "O ID do tweet é obrigatório.");

    const tweet = await this.tweetRepository.buscarPorId(id);
    if (!tweet) throw new AppError("Tweet não encontrado.", 404);

    return tweet;
  }

  async criarReply(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.parentId, "O ID do tweet original é obrigatório.");

    if (dto.content === undefined || dto.content === "") {
      throw new AppError("O conteúdo da resposta é obrigatório.", 400);
    }
    this.validarConteudo(dto.content, "resposta");

    await this.buscarPorId(dto.parentId as string);

    return this.tweetRepository.criarReply(dto, userId);
  }

  async buscarFeedUsuario(userId: string): Promise<Tweet[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const tweets = await this.tweetRepository.buscarFeedUsuario(userId);
    return tweets ?? [];
  }
}
