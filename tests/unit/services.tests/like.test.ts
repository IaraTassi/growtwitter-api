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
      buscarLike: jest.fn(),
      adicionarLike: jest.fn(),
      removerLike: jest.fn(),
    } as jest.Mocked<LikeRepository>;
    service = new LikeService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("LikeService - buscarLike", () => {
    it("deve retornar o like existente", async () => {
      mockRepository.buscarLike.mockResolvedValue(mockLike as any);

      const result = await service.buscarLike("tweet123", "user1");

      expect(result).toEqual(mockLike);
      expect(mockRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
    });

    it("deve retornar null se o like não existir", async () => {
      mockRepository.buscarLike.mockResolvedValue(null);

      const result = await service.buscarLike("tweet123", "user1");

      expect(result).toBeNull();
      expect(mockRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
    });

    it("deve lançar erro se o ID do tweet não for informado", async () => {
      await expect(service.buscarLike("", "user1")).rejects.toThrow(
        "O ID do tweet é obrigatório."
      );
    });

    it("deve lançar erro se o ID do usuário não for informado", async () => {
      await expect(service.buscarLike("tweet123", "")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });
  });

  describe("LikeService - adicionarLike", () => {
    it("deve adicionar um like com sucesso", async () => {
      mockRepository.buscarLike.mockResolvedValue(null);
      mockRepository.adicionarLike.mockResolvedValue(mockLike as any);

      const result = await service.adicionarLike(validDto, "user1");

      expect(result).toEqual(mockLike);
      expect(mockRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
      expect(mockRepository.adicionarLike).toHaveBeenCalledWith(
        validDto,
        "user1"
      );
    });

    it("deve lançar erro se o like já existir", async () => {
      mockRepository.buscarLike.mockResolvedValue(mockLike as any);

      await expect(service.adicionarLike(validDto, "user1")).rejects.toThrow(
        "Usuário já curtiu este tweet."
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
      mockRepository.buscarLike.mockResolvedValue(mockLike as any);
      mockRepository.removerLike.mockResolvedValue(undefined);

      await service.removerLike("tweet123", "user1");

      expect(mockRepository.buscarLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
      expect(mockRepository.removerLike).toHaveBeenCalledWith(
        "tweet123",
        "user1"
      );
    });

    it("deve lançar erro se o like não existir", async () => {
      mockRepository.buscarLike.mockResolvedValue(null);

      await expect(service.removerLike("tweet123", "user1")).rejects.toThrow(
        "Like não encontrado para remoção."
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
