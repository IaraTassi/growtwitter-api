import { FollowService } from "../../../src/services/follow.service";
import { FollowRepository } from "../../../src/repositories/follow.repository";
import { Follow } from "../../../src/interfaces/follow.interface";

describe("FollowService - Testes Unitários", () => {
  let service: FollowService;
  let mockRepository: jest.Mocked<FollowRepository>;

  const seguidorId = "user1";
  const seguindoId = "user2";

  const followMock: Follow = {
    followerId: seguidorId,
    followingId: seguindoId,
    createdAt: new Date(),
    follower: undefined,
    following: undefined,
  };

  beforeEach(() => {
    mockRepository = {
      buscarFollow: jest.fn(),
      seguirUsuario: jest.fn(),
      deixarDeSeguirUsuario: jest.fn(),
    } as jest.Mocked<FollowRepository>;

    service = new FollowService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("FollowService - buscarFollow", () => {
    it("deve retornar o follow encontrado com sucesso", async () => {
      mockRepository.buscarFollow.mockResolvedValue(followMock);

      const result = await service.buscarFollow("user1", "user2");

      expect(result).toEqual(followMock);
      expect(mockRepository.buscarFollow).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
    });

    it("deve retornar null se o follow não existir", async () => {
      mockRepository.buscarFollow.mockResolvedValue(null);

      const result = await service.buscarFollow("user1", "user2");

      expect(result).toBeNull();
      expect(mockRepository.buscarFollow).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
    });

    it("deve lançar erro se o ID do seguidor não for informado", async () => {
      await expect(service.buscarFollow("", "user2")).rejects.toThrow(
        "O ID do seguidor é obrigatório."
      );
    });

    it("deve lançar erro se o ID do seguido não for informado", async () => {
      await expect(service.buscarFollow("user1", "")).rejects.toThrow(
        "O ID do usuário seguido é obrigatório."
      );
    });
  });

  describe("FollowService - seguirUsuario", () => {
    it("deve seguir um usuário com sucesso", async () => {
      mockRepository.buscarFollow.mockResolvedValue(null);
      mockRepository.seguirUsuario.mockResolvedValue(followMock);

      const result = await service.seguirUsuario(
        { followingId: "user2" },
        "user1"
      );

      expect(result).toEqual(followMock);
      expect(mockRepository.buscarFollow).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
      expect(mockRepository.seguirUsuario).toHaveBeenCalledWith(
        { followingId: "user2" },
        "user1"
      );
    });

    it("deve lançar erro se já estiver seguindo o usuário", async () => {
      mockRepository.buscarFollow.mockResolvedValue(followMock);

      await expect(
        service.seguirUsuario({ followingId: "user2" }, "user1")
      ).rejects.toThrow("O usuário já está seguindo este perfil.");
    });

    it("deve lançar erro se seguidor não for informado", async () => {
      await expect(
        service.seguirUsuario({ followingId: "user2" }, "")
      ).rejects.toThrow("O ID do seguidor é obrigatório.");
    });

    it("deve lançar erro se seguindo não for informado", async () => {
      await expect(
        service.seguirUsuario({ followingId: "" }, "user1")
      ).rejects.toThrow("O ID do usuário a ser seguido é obrigatório.");
    });

    it("deve lançar erro ao tentar seguir a si mesmo", async () => {
      await expect(
        service.seguirUsuario({ followingId: "user1" }, "user1")
      ).rejects.toThrow("Um usuário não pode seguir a si mesmo.");
    });
  });

  describe("FollowService - deixarDeSeguirUsuario", () => {
    it("deve deixar de seguir um usuário com sucesso", async () => {
      mockRepository.buscarFollow.mockResolvedValue(followMock);
      mockRepository.deixarDeSeguirUsuario.mockResolvedValue();

      await service.deixarDeSeguirUsuario("user1", "user2");

      expect(mockRepository.buscarFollow).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
      expect(mockRepository.deixarDeSeguirUsuario).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
    });

    it("deve lançar erro se não estiver seguindo o usuário", async () => {
      mockRepository.buscarFollow.mockResolvedValue(null);

      await expect(
        service.deixarDeSeguirUsuario("user1", "user2")
      ).rejects.toThrow("O usuário não segue este perfil.");
    });

    it("deve lançar erro se seguidor não for informado", async () => {
      await expect(service.deixarDeSeguirUsuario("", "user2")).rejects.toThrow(
        "O ID do seguidor é obrigatório."
      );
    });

    it("deve lançar erro se seguindo não for informado", async () => {
      await expect(service.deixarDeSeguirUsuario("user1", "")).rejects.toThrow(
        "O ID do usuário a ser deixado de seguir é obrigatório."
      );
    });

    it("deve lançar erro ao tentar deixar de seguir a si mesmo", async () => {
      await expect(
        service.deixarDeSeguirUsuario("user1", "user1")
      ).rejects.toThrow("Um usuário não pode deixar de seguir a si mesmo.");
    });
  });
});
