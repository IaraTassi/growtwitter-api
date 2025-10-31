import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRepository } from "../../../src/repositories/user.repository";
import { UserService } from "../../../src/services/user.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe("UserService - Testes Unitários", () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const validDto = {
    name: "Test User",
    userName: "testuser",
    email: "test@example.com",
    password: "123456",
    imageUrl: "https://img.com/user.png",
  };

  beforeEach(() => {
    mockRepository = {
      criarUsuario: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorIdentificador: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new UserService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("UserService - criarUsuario", () => {
    it("deve criar usuário com sucesso", async () => {
      const spyValidarCampo = jest.spyOn<any, any>(
        service as any,
        "validarCampo"
      );
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);
      mockRepository.criarUsuario.mockResolvedValue({
        id: "1",
        ...validDto,
      } as any);

      const result = await (service as any).criarUsuario(validDto);

      expect(result).toHaveProperty("id", "1");
      expect(spyValidarCampo).toHaveBeenCalledTimes(4);
      expect(mockRepository.criarUsuario).toHaveBeenCalledWith(validDto);
    });

    it("deve lançar erro se nome de usuário já existir", async () => {
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce({ id: "1" } as any)
        .mockResolvedValueOnce(null);

      await expect((service as any).criarUsuario(validDto)).rejects.toThrow(
        "O nome de usuário já está em uso."
      );
    });

    it("deve lançar erro se email já estiver em uso", async () => {
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "1" } as any);

      await expect((service as any).criarUsuario(validDto)).rejects.toThrow(
        "O email já está em uso."
      );
    });

    it("deve lançar erro se nome estiver vazio", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, name: "" })
      ).rejects.toThrow("O nome é obrigatório.");
    });

    it("deve lançar erro se o nome do usuário estiver vazio", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, userName: "" })
      ).rejects.toThrow("O nome de usuário é obrigatório.");
    });

    it("deve lançar erro se campo email estiver vazio", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, email: "" })
      ).rejects.toThrow("O email é obrigatório.");
    });

    it("deve lançar erro se o campo senha estiver vazio", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, password: "" })
      ).rejects.toThrow("A senha é obrigatória.");
    });
  });

  describe("UserService - registrar", () => {
    it("deve registrar usuário com sucesso", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);
      mockRepository.criarUsuario.mockResolvedValue({
        id: "1",
        ...validDto,
        password: "hashed_password",
      } as any);

      const result = await service.registrar(validDto);

      expect(result).toHaveProperty("id", "1");
      expect(mockRepository.criarUsuario).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 8);
    });

    it("deve lançar erro se a senha não for informada", async () => {
      await expect(
        service.registrar({ ...validDto, password: "" })
      ).rejects.toThrow("A senha é obrigatória.");
    });

    it("deve lançar erro se o nome de usuário já estiver em uso", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce({ id: "1" } as any)
        .mockResolvedValueOnce(null);

      await expect(service.registrar(validDto)).rejects.toThrow(
        "O nome de usuário já está em uso."
      );
    });

    it("deve lançar erro se o email já estiver em uso", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "1" } as any);

      await expect(service.registrar(validDto)).rejects.toThrow(
        "O email já está em uso."
      );
    });
  });

  describe("UserService - buscarPorId", () => {
    it("deve retornar usuário se encontrado", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: "1",
        ...validDto,
      } as any);

      const result = await service.buscarPorId("1");

      expect(result).toHaveProperty("id", "1");
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith("1");
    });

    it("deve lançar erro se ID não for informado", async () => {
      await expect(service.buscarPorId("")).rejects.toThrow(
        "O ID do usuário é obrigatório."
      );
    });
  });

  describe("UserService - login", () => {
    const loginDto = {
      identifier: "testuser",
      password: "123456",
    };

    it("deve realizar login com sucesso", async () => {
      const fakeUser = { ...validDto, id: "1", password: "hashed" } as any;
      mockRepository.buscarPorIdentificador.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fake_token");

      process.env.JWT_SECRET = "secret";

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("token", "fake_token");
      expect(mockRepository.buscarPorIdentificador).toHaveBeenCalledWith(
        "testuser"
      );
      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed");
    });

    it("deve lançar erro se identificador não for informado", async () => {
      await expect(
        service.login({ ...loginDto, identifier: "" })
      ).rejects.toThrow("O identificador usuário ou email é obrigatório.");
    });

    it("deve lançar erro se senha não for informada", async () => {
      await expect(
        service.login({ ...loginDto, password: "" })
      ).rejects.toThrow("A senha é obrigatória.");
    });

    it("deve lançar erro se o usuário não for encontrado", async () => {
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        "Usuário não encontrado."
      );
    });

    it("deve lançar erro se a senha estiver incorreta", async () => {
      const fakeUser = { ...validDto, id: "1", password: "hashed" } as any;
      mockRepository.buscarPorIdentificador.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow("Senha incorreta.");
    });

    it("deve lançar erro se JWT_SECRET não estiver configurado", async () => {
      const fakeUser = { ...validDto, id: "1", password: "hashed" } as any;
      mockRepository.buscarPorIdentificador.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      delete process.env.JWT_SECRET;

      await expect(service.login(loginDto)).rejects.toThrow(
        "JWT_SECRET não configurado no ambiente."
      );
    });
  });
});
