import { FollowService } from "../../../src/services/follow.service";
import { FollowRepository } from "../../../src/repositories/follow.repository";
import { Follow } from "../../../src/interfaces/follow.interface";

describe("FollowService - Testes Unitários", () => {
  let service: FollowService;
  let mockRepository: jest.Mocked<FollowRepository>;

  beforeEach(() => {
    mockRepository = {
      seguirUsuario: jest.fn(),
      deixarDeSeguirUsuario: jest.fn(),
    } as jest.Mocked<FollowRepository>;

    service = new FollowService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("FollowService - seguirUsuario", () => {
    it("deve seguir um usuário com sucesso", async () => {
      const seguidorId = "user1";
      const seguindoId = "user2";

      const followMock: Follow = {
        followerId: seguidorId,
        followingId: seguindoId,
        createdAt: new Date(),
        follower: undefined,
        following: undefined,
      };

      mockRepository.seguirUsuario.mockResolvedValue(followMock);

      const result = await service.seguirUsuario(
        { followingId: seguindoId },
        seguidorId
      );

      expect(result).toEqual(followMock);
      expect(mockRepository.seguirUsuario).toHaveBeenCalledWith(
        { followingId: seguindoId },
        seguidorId
      );
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
      mockRepository.deixarDeSeguirUsuario.mockResolvedValue();

      await service.deixarDeSeguirUsuario("user1", "user2");

      expect(mockRepository.deixarDeSeguirUsuario).toHaveBeenCalledWith(
        "user1",
        "user2"
      );
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
