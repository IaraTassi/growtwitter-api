import { TweetService } from "../../../src/services/tweet.service";
import { TweetRepository } from "../../../src/repositories/tweet.repository";

describe("TweetService - Testes Unitários", () => {
  let service: TweetService;
  let mockRepository: jest.Mocked<TweetRepository>;

  const validTweetDto = { content: "Meu primeiro tweet!" };
  const validReplyDto = {
    content: "Concordo com o tweet original!",
    parentId: "tweet123",
  };

  beforeEach(() => {
    mockRepository = {
      criarTweet: jest.fn(),
      buscarPorId: jest.fn(),
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
      await expect(service.criarTweet(validTweetDto, "")).rejects.toMatchObject(
        {
          message: "O ID do usuário é obrigatório.",
          statusCode: 400,
        }
      );
    });

    it("deve lançar erro se content não for informado", async () => {
      await expect(
        service.criarTweet({ content: "" }, "user1")
      ).rejects.toMatchObject({
        message: "O conteúdo do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o tweet estiver vazio ou apenas espaços", async () => {
      await expect(
        service.criarTweet({ content: "   " }, "user1")
      ).rejects.toMatchObject({
        message: "O conteúdo do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o tweet exceder 280 caracteres", async () => {
      const longContent = "a".repeat(281);
      await expect(
        service.criarTweet({ content: longContent }, "user1")
      ).rejects.toMatchObject({
        message: "O tweet não pode ter mais de 280 caracteres.",
        statusCode: 400,
      });
    });
  });

  describe("TweetService - buscarPorId", () => {
    it("deve retornar tweet quando encontrado", async () => {
      const mockTweet = { id: "tweet123", content: "olá", userId: "user1" };
      mockRepository.buscarPorId.mockResolvedValue(mockTweet as any);

      const result = await service.buscarPorId("tweet123");

      expect(result).toEqual(mockTweet);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith("tweet123");
    });

    it("deve lançar erro se id não for informado", async () => {
      await expect(service.buscarPorId("")).rejects.toMatchObject({
        message: "O ID do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro 404 se tweet não existir", async () => {
      mockRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.buscarPorId("tweet-invalido")).rejects.toMatchObject(
        {
          message: "Tweet não encontrado.",
          statusCode: 404,
        }
      );
    });
  });

  describe("TweetService - criarReply", () => {
    it("deve criar uma resposta com sucesso", async () => {
      const mockReply = {
        id: "2",
        content: validReplyDto.content,
        parentId: "tweet123",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.buscarPorId.mockResolvedValue({
        id: "tweet123",
        content: "tweet original",
        userId: "user1",
      } as any);
      mockRepository.criarReply.mockResolvedValue(mockReply as any);

      const result = await service.criarReply(validReplyDto, "user1");

      expect(result).toEqual(mockReply);
      expect(mockRepository.criarReply).toHaveBeenCalledWith(
        validReplyDto,
        "user1"
      );
    });

    it("deve lançar erro se userId não for informado", async () => {
      await expect(service.criarReply(validReplyDto, "")).rejects.toMatchObject(
        {
          message: "O ID do usuário é obrigatório.",
          statusCode: 400,
        }
      );
    });

    it("deve lançar erro se content não for informado", async () => {
      await expect(
        service.criarReply({ ...validReplyDto, content: "" }, "user1")
      ).rejects.toMatchObject({
        message: "O conteúdo da resposta é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se parentId não for informado", async () => {
      await expect(
        service.criarReply({ content: "resposta", parentId: "" }, "user1")
      ).rejects.toMatchObject({
        message: "O ID do tweet original é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se conteúdo da resposta estiver vazio ou apenas espaços", async () => {
      await expect(
        service.criarReply({ content: "   ", parentId: "tweet123" }, "user1")
      ).rejects.toMatchObject({
        message: "O conteúdo da resposta não pode estar vazio.",
        statusCode: 400,
      });
    });

    it("deve lançar erro 404 se tweet original não existir", async () => {
      mockRepository.buscarPorId.mockResolvedValue(null);
      await expect(
        service.criarReply(validReplyDto, "user1")
      ).rejects.toMatchObject({
        message: "Tweet não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("TweetService - buscarFeedUsuario", () => {
    it("deve retornar feed do usuário com sucesso", async () => {
      const tweetsMock = [
        { id: "1", content: "tweet 1", userId: "user1" },
        { id: "2", content: "tweet 2", userId: "user2" },
      ];

      mockRepository.buscarFeedUsuario.mockResolvedValue(tweetsMock as any);

      const result = await service.buscarFeedUsuario("user1");

      expect(result).toEqual(tweetsMock);
      expect(mockRepository.buscarFeedUsuario).toHaveBeenCalledWith("user1");
    });

    it("deve lançar erro se userId não for informado", async () => {
      await expect(service.buscarFeedUsuario("")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve retornar array vazio se usuário não tiver tweets", async () => {
      mockRepository.buscarFeedUsuario.mockResolvedValue([]);
      const result = await service.buscarFeedUsuario("user1");
      expect(result).toEqual([]);
    });
  });
});
