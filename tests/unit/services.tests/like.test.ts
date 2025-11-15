import { LikeService } from "../../../src/services/like.service";
import { LikeRepository } from "../../../src/repositories/like.repository";
import { UserRepository } from "../../../src/repositories/user.repository";
import { TweetRepository } from "../../../src/repositories/tweet.repository";
import { LikeDto } from "../../../src/dtos/like.dto";
import { User } from "../../../src/interfaces/user.interface";
import { Tweet } from "../../../src/interfaces/tweet.interface";
import { Like } from "../../../src/interfaces/like.interface";

describe("LikeService - Testes Unitários", () => {
  let service: LikeService;
  let mockLikeRepository: Partial<jest.Mocked<LikeRepository>>;
  let mockTweetRepository: Partial<jest.Mocked<TweetRepository>>;
  let mockUserRepository: Partial<jest.Mocked<UserRepository>>;

  const validDto: LikeDto = { tweetId: "tweet123" };

  const mockLike: Like = {
    tweetId: "tweet123",
    userId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTweet: Tweet = {
    id: "tweet123",
    content: "Olá mundo",
    userId: "user2",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: "user1",
    userName: "teste",
    name: "Teste User",
    email: "teste@example.com",
    password: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockLikeRepository = {
      buscarLike: jest.fn(),
      adicionarLike: jest.fn(),
      removerLike: jest.fn(),
    };

    mockTweetRepository = {
      buscarPorId: jest.fn().mockResolvedValue(mockTweet),
    };

    mockUserRepository = {
      buscarPorId: jest.fn().mockResolvedValue(mockUser),
    };

    service = new LikeService();
    service.setRepositoryParaTestes(
      mockLikeRepository as jest.Mocked<LikeRepository>,
      mockTweetRepository as jest.Mocked<TweetRepository>,
      mockUserRepository as jest.Mocked<UserRepository>
    );
  });

  describe("LikeService - adicionarLike", () => {
    it("deve adicionar um like com sucesso", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(null);
      mockLikeRepository.adicionarLike!.mockResolvedValue(mockLike);

      const result = await service.adicionarLike(validDto, "user1");

      expect(result).toEqual(mockLike);
      expect(mockLikeRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
      expect(mockLikeRepository.adicionarLike).toHaveBeenCalledWith(
        validDto,
        "user1"
      );
    });

    it("não deve permitir curtir o próprio tweet", async () => {
      mockTweetRepository.buscarPorId!.mockResolvedValue({
        ...mockTweet,
        userId: "user1",
      });

      await expect(
        service.adicionarLike(validDto, "user1")
      ).rejects.toMatchObject({
        message: "Usuário não pode curtir o próprio tweet.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se o like já existir", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(mockLike);

      await expect(
        service.adicionarLike(validDto, "user1")
      ).rejects.toMatchObject({
        message: "Usuário já curtiu este tweet.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(
        service.adicionarLike({ tweetId: "" }, "user1")
      ).rejects.toMatchObject({
        message: "O ID do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.adicionarLike(validDto, "")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o usuário não existir", async () => {
      mockUserRepository.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.adicionarLike(validDto, "user1")
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se o tweet não existir", async () => {
      mockTweetRepository.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.adicionarLike(validDto, "user1")
      ).rejects.toMatchObject({
        message: "Tweet não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("LikeService - buscarLike", () => {
    it("deve retornar o like existente", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(mockLike);

      const result = await service.buscarLike("tweet123", "user1");

      expect(result).toEqual(mockLike);
    });

    it("deve retornar null se o like não existir", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(null);

      const result = await service.buscarLike("tweet123", "user1");

      expect(result).toBeNull();
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(service.buscarLike("", "user1")).rejects.toMatchObject({
        message: "O ID do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.buscarLike("tweet123", "")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o usuário não existir", async () => {
      mockUserRepository.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.buscarLike("tweet123", "user1")
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se o tweet não existir", async () => {
      mockTweetRepository.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.buscarLike("tweet123", "user1")
      ).rejects.toMatchObject({
        message: "Tweet não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("LikeService - removerLike", () => {
    it("deve remover um like com sucesso", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(mockLike);
      mockLikeRepository.removerLike!.mockResolvedValue();

      await service.removerLike("tweet123", "user1");

      expect(mockLikeRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
      expect(mockLikeRepository.removerLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
    });

    it("deve lançar erro se o like não existir", async () => {
      mockLikeRepository.buscarLike!.mockResolvedValue(null);

      await expect(
        service.removerLike("tweet123", "user1")
      ).rejects.toMatchObject({
        message: "Like não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(service.removerLike("", "user1")).rejects.toMatchObject({
        message: "O ID do tweet é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.removerLike("tweet123", "")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });
  });
});
