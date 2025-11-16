import { FollowService } from "../../../src/services/follow.service";
import { FollowRepository } from "../../../src/repositories/follow.repository";
import { Follow } from "../../../src/interfaces/follow.interface";
import { UserRepository } from "../../../src/repositories/user.repository";
import { User } from "../../../src/interfaces/user.interface";

describe("FollowService - Testes Unitários", () => {
  let service: FollowService;
  let mockFollowRepository: Partial<jest.Mocked<FollowRepository>>;
  let mockUserRepository: Partial<jest.Mocked<UserRepository>>;

  const seguidorId = "user1";
  const seguindoId = "user2";

  const followMock: Follow = {
    followerId: seguidorId,
    followingId: seguindoId,
    createdAt: new Date(),
    follower: undefined,
    following: undefined,
  };

  const mockSeguidor: User = {
    id: seguidorId,
    name: "Usuário Seguidor",
    email: "seguidor@example.com",
    userName: "seguidor",
    password: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSeguido: User = {
    id: seguindoId,
    name: "Usuário Seguido",
    email: "seguido@example.com",
    userName: "seguido",
    password: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockFollowRepository = {
      buscarFollow: jest.fn(),
      seguirUsuario: jest.fn(),
      deixarDeSeguirUsuario: jest.fn(),
    };

    mockUserRepository = {
      buscarPorId: jest.fn((id: string) => {
        if (id === seguidorId) return Promise.resolve(mockSeguidor);
        if (id === seguindoId) return Promise.resolve(mockSeguido);
        return Promise.resolve(null);
      }),
    };

    service = new FollowService();
    service.setRepositoryParaTestes(
      mockFollowRepository as jest.Mocked<FollowRepository>,
      mockUserRepository as jest.Mocked<UserRepository>
    );

    jest.clearAllMocks();
  });

  describe("FollowService - seguirUsuario", () => {
    it("deve seguir um usuário com sucesso", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(null);
      mockFollowRepository.seguirUsuario!.mockResolvedValue(followMock);

      const result = await service.seguirUsuario(
        { followingId: seguindoId },
        seguidorId
      );

      expect(result).toEqual(followMock);
      expect(mockFollowRepository.buscarFollow).toHaveBeenCalledWith(
        seguidorId,
        seguindoId
      );
      expect(mockFollowRepository.seguirUsuario).toHaveBeenCalledWith(
        seguidorId,
        seguindoId
      );
    });

    it("deve lançar erro se já estiver seguindo o usuário", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(followMock);

      await expect(
        service.seguirUsuario({ followingId: seguindoId }, seguidorId)
      ).rejects.toMatchObject({
        message: "O usuário já está seguindo este perfil.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se seguidor não for informado", async () => {
      await expect(
        service.seguirUsuario({ followingId: seguindoId }, "")
      ).rejects.toMatchObject({
        message: "O ID do seguidor é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se seguindo não for informado", async () => {
      await expect(
        service.seguirUsuario({ followingId: "" }, seguidorId)
      ).rejects.toMatchObject({
        message: "O ID do usuário a ser seguido é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro ao tentar seguir a si mesmo", async () => {
      await expect(
        service.seguirUsuario({ followingId: seguidorId }, seguidorId)
      ).rejects.toMatchObject({
        message: "Um usuário não pode seguir a si mesmo.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se seguidor não existir", async () => {
      mockUserRepository.buscarPorId!.mockResolvedValueOnce(null);
      await expect(
        service.seguirUsuario({ followingId: seguindoId }, seguidorId)
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se seguindo não existir", async () => {
      mockUserRepository.buscarPorId!.mockImplementationOnce((id: string) =>
        id === seguidorId
          ? Promise.resolve(mockSeguidor)
          : Promise.resolve(null)
      );
      await expect(
        service.seguirUsuario({ followingId: "invalid" }, seguidorId)
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("FollowService - buscarFollow", () => {
    it("deve retornar o follow encontrado com sucesso", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(followMock);

      const result = await service.buscarFollow(seguidorId, seguindoId);

      expect(result).toEqual(followMock);
      expect(mockFollowRepository.buscarFollow).toHaveBeenCalledWith(
        seguidorId,
        seguindoId
      );
    });

    it("deve lançar erro 404 se o follow não existir", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(null);

      await expect(
        service.buscarFollow(seguidorId, seguindoId)
      ).rejects.toMatchObject({
        message: "Follow não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se seguidor não for informado", async () => {
      await expect(service.buscarFollow("", seguindoId)).rejects.toMatchObject({
        message: "O ID do seguidor é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se seguindo não for informado", async () => {
      await expect(service.buscarFollow(seguidorId, "")).rejects.toMatchObject({
        message: "O ID do usuário a ser seguido é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se seguidor não existir", async () => {
      mockUserRepository.buscarPorId!.mockResolvedValueOnce(null);
      await expect(
        service.buscarFollow(seguidorId, seguindoId)
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se seguindo não existir", async () => {
      mockUserRepository.buscarPorId!.mockImplementationOnce((id: string) =>
        id === seguidorId
          ? Promise.resolve(mockSeguidor)
          : Promise.resolve(null)
      );
      await expect(
        service.buscarFollow(seguidorId, "invalid")
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("FollowService - deixarDeSeguirUsuario", () => {
    it("deve deixar de seguir um usuário com sucesso", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(followMock);
      mockFollowRepository.deixarDeSeguirUsuario!.mockResolvedValue();

      await service.deixarDeSeguirUsuario(seguidorId, seguindoId);

      expect(mockFollowRepository.buscarFollow).toHaveBeenCalledWith(
        seguidorId,
        seguindoId
      );
      expect(mockFollowRepository.deixarDeSeguirUsuario).toHaveBeenCalledWith(
        seguidorId,
        seguindoId
      );
    });

    it("deve lançar erro se não estiver seguindo o usuário", async () => {
      mockFollowRepository.buscarFollow!.mockResolvedValue(null);

      await expect(
        service.deixarDeSeguirUsuario(seguidorId, seguindoId)
      ).rejects.toMatchObject({
        message: "O usuário não segue este perfil.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se seguidor não for informado", async () => {
      await expect(
        service.deixarDeSeguirUsuario("", seguindoId)
      ).rejects.toMatchObject({
        message: "O ID do seguidor é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se seguindo não for informado", async () => {
      await expect(
        service.deixarDeSeguirUsuario(seguidorId, "")
      ).rejects.toMatchObject({
        message: "O ID do usuário a ser deixado de seguir é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro ao tentar deixar de seguir a si mesmo", async () => {
      mockFollowRepository!.buscarFollow!.mockResolvedValue(null);

      await expect(
        service.deixarDeSeguirUsuario(seguidorId, seguidorId)
      ).rejects.toMatchObject({
        message: "Um usuário não pode deixar de seguir a si mesmo.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se seguidor não existir", async () => {
      mockUserRepository.buscarPorId!.mockResolvedValueOnce(null);
      await expect(
        service.deixarDeSeguirUsuario(seguidorId, seguindoId)
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se seguindo não existir", async () => {
      mockUserRepository.buscarPorId!.mockImplementationOnce((id: string) =>
        id === seguidorId
          ? Promise.resolve(mockSeguidor)
          : Promise.resolve(null)
      );
      await expect(
        service.deixarDeSeguirUsuario(seguidorId, "invalid")
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });
  });
});
