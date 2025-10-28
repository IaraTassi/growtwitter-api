import { CreateTweetDto } from "../dtos/create.tweet.dto";
import { Tweet } from "../interfaces/tweet.interface";
import { TweetRepository } from "../repositories/tweet.repository";

export class TweetService {
  private tweetRepository = new TweetRepository();

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new Error(mensagem);
  }

  async criarTweet(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.content, "O conteúdo do tweet é obrigatório.");

    if (dto.content.trim().length === 0)
      throw new Error("O tweet não pode estar vazio.");

    const tweet = await this.tweetRepository.criarTweet(dto, userId);

    return tweet;
  }

  async criarReply(dto: CreateTweetDto, userId: string): Promise<Tweet> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");
    this.validarCampo(dto.content, "O conteúdo da resposta é obrigatório.");
    this.validarCampo(dto.parentId, "O ID do tweet original é obrigatório.");

    if (dto.content.trim().length === 0)
      throw new Error("A resposta não pode estar vazia.");

    const reply = await this.tweetRepository.criarReply(dto, userId);

    return reply;
  }

  async buscarFeedUsuario(userId: string): Promise<Tweet[]> {
    this.validarCampo(userId, "O ID do usuário é obrigatório.");

    const tweets = await this.tweetRepository.buscarFeedUsuario(userId);

    return tweets ?? [];
  }
}
