import { TweetService } from "../../../src/services/tweet.service";
import { TweetRepository } from "../../../src/repositories/tweet.repository";

describe("TweetService - Testes Unitários", () => {
  let service: TweetService;
  let mockRepository: jest.Mocked<TweetRepository>;

  const validTweetDto = {
    content: "Meu primeiro tweet!",
  };

  const validReplyDto = {
    content: "Concordo com o tweet original!",
    parentId: "tweet123",
  };

  beforeEach(() => {
    mockRepository = {
      criarTweet: jest.fn(),
      criarReply: jest.fn(),
      buscarFeedUsuario: jest.fn(),
    } as jest.Mocked<TweetRepository>;

    service = new TweetService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("TweetService - criarTweet", () => {
    it("deve criar um tweet com sucesso", async () => {
      const mockTweet = {
        id: "1",
        content: validTweetDto.content,
        userId: "user1",
      };
      mockRepository.criarTweet.mockResolvedValue(mockTweet as any);

      const result = await service.criarTweet(validTweetDto, "user1");

      expect(result).toEqual(mockTweet);
      expect(mockRepository.criarTweet).toHaveBeenCalledWith(
        validTweetDto,
        "user1"
      );
    });

    it("deve lançar erro se userId não for informado", async () => {
      await expect(service.criarTweet(validTweetDto, "")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });

    it("deve lançar erro se content não for informado", async () => {
      await expect(
        service.criarTweet({ content: "" }, "user1")
      ).rejects.toThrow("O conteúdo do tweet é obrigatório.");
    });

    it("deve lançar erro se o tweet estiver vazio", async () => {
      await expect(
        service.criarTweet({ content: "   " }, "user1")
      ).rejects.toThrow("O conteúdo do tweet é obrigatório.");
    });
  });

  describe("TweetService - criarReply", () => {
    it("deve criar uma resposta com sucesso", async () => {
      const mockReply = {
        id: "2",
        content: validReplyDto.content,
        parentId: "tweet123",
        userId: "user1",
      };
      mockRepository.criarReply.mockResolvedValue(mockReply as any);

      const result = await service.criarReply(validReplyDto, "user1");

      expect(result).toEqual(mockReply);
      expect(mockRepository.criarReply).toHaveBeenCalledWith(
        validReplyDto,
        "user1"
      );
    });

    it("deve lançar erro se userId não for informado", async () => {
      await expect(service.criarReply(validReplyDto, "")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });

    it("deve lançar erro se content não for informado", async () => {
      await expect(
        service.criarReply({ ...validReplyDto, content: "" }, "user1")
      ).rejects.toThrow("O conteúdo da resposta é obrigatório.");
    });

    it("deve lançar erro se o ID do tweet original não for informado", async () => {
      await expect(
        service.criarReply({ content: "resposta", parentId: "" }, "user1")
      ).rejects.toThrow("O ID do tweet original é obrigatório.");
    });

    it("deve lançar erro se o conteúdo da resposta estiver vazio", async () => {
      await expect(
        service.criarReply({ content: "   ", parentId: "tweet123" }, "user1")
      ).rejects.toThrow("O conteúdo da resposta é obrigatório.");
    });
  });

  describe("TweetService - buscarFeedUsuario", () => {
    it("deve retornar o feed do usuário com sucesso", async () => {
      const tweetsMock = [
        { id: "1", content: "tweet 1", userId: "user1" },
        { id: "2", content: "tweet 2", userId: "user2" },
      ];

      mockRepository.buscarFeedUsuario.mockResolvedValue(tweetsMock as any);

      const result = await service.buscarFeedUsuario("user1");

      expect(result).toEqual(tweetsMock);
      expect(mockRepository.buscarFeedUsuario).toHaveBeenCalledWith("user1");
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.buscarFeedUsuario("")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });
  });
});
