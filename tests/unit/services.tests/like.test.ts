import { LikeService } from "../../../src/services/like.service";
import { LikeRepository } from "../../../src/repositories/like.repository";

describe("LikeService - Testes Unitários", () => {
  let service: LikeService;
  let mockRepository: jest.Mocked<LikeRepository>;

  const validDto = {
    tweetId: "tweet123",
  };

  const mockLike = { id: "1", tweetId: "tweet123", userId: "user1" };

  beforeEach(() => {
    mockRepository = {
      adicionarLike: jest.fn(),
      removerLike: jest.fn(),
    } as jest.Mocked<LikeRepository>;
    service = new LikeService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("LikeService - adicionarLike", () => {
    it("deve adicionar um like com sucesso", async () => {
      mockRepository.adicionarLike.mockResolvedValue(mockLike as any);

      const result = await service.adicionarLike(validDto, "user1");

      expect(result).toEqual(mockLike);
      expect(mockRepository.adicionarLike).toHaveBeenCalledWith(
        validDto,
        "user1"
      );
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(
        service.adicionarLike({ tweetId: "" }, "user1")
      ).rejects.toThrow("O ID do tweet é obrigatório.");
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.adicionarLike(validDto, "")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });
  });

  describe("LikeService - removerLike", () => {
    it("deve remover um like com sucesso", async () => {
      mockRepository.removerLike.mockResolvedValue(undefined);

      await service.removerLike("tweet123", "user1");

      expect(mockRepository.removerLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(service.removerLike("", "user1")).rejects.toThrow(
        "O ID do tweet é obrigatório."
      );
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.removerLike("tweet123", "")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });
  });
});
