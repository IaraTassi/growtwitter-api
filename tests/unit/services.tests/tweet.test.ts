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
      buscarReplies: jest.fn(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        userId: "usuarioDiferente",
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
        message: "O conteúdo da resposta não pode estar vazio.",
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

    it("deve lançar erro se tentar responder ao próprio tweet", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: "tweet123",
        content: "tweet original",
        userId: "user1",
      } as any);

      await expect(
        service.criarReply(validReplyDto, "user1")
      ).rejects.toMatchObject({
        message: "Você não pode responder ao próprio tweet.",
        statusCode: 400,
      });
    });
  });

  describe("TweetService - buscarReplies", () => {
    const tweetId = "tweet123";
    const mockReplies = [
      {
        id: "1",
        content: "Primeira reply",
        parentId: tweetId,
        userId: "user2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        content: "Segunda reply",
        parentId: tweetId,
        userId: "user3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("deve retornar replies e totalCount com sucesso", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: tweetId,
        content: "tweet original",
        userId: "user1",
      } as any);

      mockRepository.buscarReplies.mockResolvedValue({
        replies: mockReplies as any,
        totalCount: 2,
      });

      const result = await service.buscarReplies(tweetId);

      expect(result).toEqual({
        replies: mockReplies,
        totalCount: 2,
      });

      expect(mockRepository.buscarPorId).toHaveBeenCalledWith(tweetId);
      expect(mockRepository.buscarReplies).toHaveBeenCalledWith(tweetId, 0, 5);
    });

    it("deve lançar erro se tweetId não for informado", async () => {
      await expect(service.buscarReplies("")).rejects.toMatchObject({
        message: "O ID do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro 404 se tweet original não existir", async () => {
      mockRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.buscarReplies(tweetId)).rejects.toMatchObject({
        message: "Tweet não encontrado.",
        statusCode: 404,
      });
    });

    it("deve retornar array vazio e totalCount 0 se não houver replies", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: tweetId,
        content: "tweet original",
        userId: "user1",
      } as any);

      mockRepository.buscarReplies.mockResolvedValue({
        replies: [],
        totalCount: 0,
      });

      const result = await service.buscarReplies(tweetId);

      expect(result).toEqual({
        replies: [],
        totalCount: 0,
      });
    });

    it("deve respeitar skip e take se fornecidos", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: tweetId,
        content: "tweet original",
        userId: "user1",
      } as any);

      mockRepository.buscarReplies.mockResolvedValue({
        replies: mockReplies as any,
        totalCount: 10,
      });

      const skip = 2;
      const take = 3;
      const result = await service.buscarReplies(tweetId, skip, take);

      expect(mockRepository.buscarReplies).toHaveBeenCalledWith(
        tweetId,
        skip,
        take
      );
      expect(result).toEqual({
        replies: mockReplies,
        totalCount: 10,
      });
    });
  });
});
