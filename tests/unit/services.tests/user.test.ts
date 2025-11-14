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
      listarUsuarios: jest.fn(),
      removerUsuario: jest.fn(),
      buscarPorIdentificador: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new UserService();
    service.setRepositoryParaTestes(mockRepository);
    jest.clearAllMocks();
  });

  describe("UserService - criarUsuario", () => {
    it("deve criar usuário com sucesso", async () => {
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);
      mockRepository.criarUsuario.mockResolvedValue({
        id: "1",
        ...validDto,
      } as any);

      const result = await (service as any).criarUsuario(validDto);

      expect(result).toHaveProperty("id", "1");
      expect(mockRepository.criarUsuario).toHaveBeenCalledWith(validDto);
    });

    it("deve lançar erro se nome de usuário já existir", async () => {
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce({ id: "1" } as any) // username existe
        .mockResolvedValueOnce(null); // email não existe

      await expect(
        (service as any).criarUsuario(validDto)
      ).rejects.toMatchObject({
        message: "O nome de usuário já está em uso.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se email já estiver em uso", async () => {
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce(null) // username não existe
        .mockResolvedValueOnce({ id: "1" } as any); // email existe

      await expect(
        (service as any).criarUsuario(validDto)
      ).rejects.toMatchObject({
        message: "O email já está em uso.",
        statusCode: 409,
      });
    });

    it.each([
      ["name", "O nome é obrigatório."],
      ["userName", "O nome de usuário é obrigatório."],
      ["email", "O email é obrigatório."],
      ["password", "A senha é obrigatória."],
    ])(
      "deve lançar erro se campo %s estiver vazio",
      async (campo, mensagem) => {
        await expect(
          (service as any).criarUsuario({ ...validDto, [campo]: "" })
        ).rejects.toMatchObject({ message: mensagem, statusCode: 400 });
      }
    );

    it("deve lançar erro se senha tiver menos de 6 caracteres", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, password: "123" })
      ).rejects.toMatchObject({
        message: "A senha deve ter pelo menos 6 caracteres.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se email inválido", async () => {
      await expect(
        (service as any).criarUsuario({ ...validDto, email: "invalidemail" })
      ).rejects.toMatchObject({
        message: "Email inválido.",
        statusCode: 400,
      });
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
      expect(mockRepository.criarUsuario).toHaveBeenCalledWith({
        ...validDto,
        password: "hashed_password",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 8);
    });

    it("deve lançar erro se senha não for informada", async () => {
      await expect(
        service.registrar({ ...validDto, password: "" })
      ).rejects.toMatchObject({
        message: "A senha é obrigatória.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se nome de usuário já estiver em uso", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce({ id: "1" } as any)
        .mockResolvedValueOnce(null);

      await expect(service.registrar(validDto)).rejects.toMatchObject({
        message: "O nome de usuário já está em uso.",
        statusCode: 409,
      });
    });

    it("deve lançar erro se email já estiver em uso", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "1" } as any);

      await expect(service.registrar(validDto)).rejects.toMatchObject({
        message: "O email já está em uso.",
        statusCode: 409,
      });
    });

    it("deve registrar usuário com sucesso quando imageUrl é fornecida", async () => {
      const dtoComImagem = {
        ...validDto,
        imageUrl: "https://img.com/test.png",
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);
      mockRepository.criarUsuario.mockResolvedValue({
        id: "1",
        ...dtoComImagem,
        password: "hashed_password",
      } as any);

      const result = await service.registrar(dtoComImagem);

      expect(result).toHaveProperty("id", "1");
      expect(result).toHaveProperty("imageUrl", "https://img.com/test.png");
      expect(mockRepository.criarUsuario).toHaveBeenCalledWith({
        ...dtoComImagem,
        password: "hashed_password",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dtoComImagem.password, 8);
    });

    it("deve registrar usuário com sucesso mesmo sem imageUrl", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      const dtoSemImagem = { ...validDto, imageUrl: undefined };
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);
      mockRepository.criarUsuario.mockResolvedValue({
        id: "1",
        ...dtoSemImagem,
        password: "hashed_password",
      } as any);

      const result = await service.registrar(dtoSemImagem);

      expect(result).toHaveProperty("id", "1");
      expect(mockRepository.criarUsuario).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(dtoSemImagem.password, 8);
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
      await expect(service.buscarPorId("")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      mockRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.buscarPorId("999")).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });
  });

  describe("UserService - login", () => {
    const loginDto = { identifier: "testuser", password: "123456" };

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
      ).rejects.toMatchObject({
        message: "O identificador usuário ou email é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se senha não for informada", async () => {
      await expect(
        service.login({ ...loginDto, password: "" })
      ).rejects.toMatchObject({
        message: "A senha é obrigatória.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se usuário não for encontrado", async () => {
      mockRepository.buscarPorIdentificador.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: "Usuário não encontrado.",
        statusCode: 404,
      });
    });

    it("deve lançar erro se a senha estiver incorreta", async () => {
      const fakeUser = { ...validDto, id: "1", password: "hashed" } as any;
      mockRepository.buscarPorIdentificador.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: "Senha incorreta.",
        statusCode: 401,
      });
    });

    it("deve lançar erro se JWT_SECRET não estiver configurado", async () => {
      const fakeUser = { ...validDto, id: "1", password: "hashed" } as any;
      mockRepository.buscarPorIdentificador.mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      delete process.env.JWT_SECRET;

      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: "JWT_SECRET não configurado no ambiente.",
        statusCode: 500,
      });
    });
  });

  describe("UserService - listarUsuarios", () => {
    it("deve retornar lista de usuários", async () => {
      const usersMock = [
        { id: "1", ...validDto } as any,
        { id: "2", ...validDto } as any,
      ];
      mockRepository.listarUsuarios.mockResolvedValue(usersMock);

      const result = await service.listarUsuarios();

      expect(result).toHaveLength(2);
      expect(mockRepository.listarUsuarios).toHaveBeenCalled();
    });

    it("deve retornar array vazio se não houver usuários", async () => {
      mockRepository.listarUsuarios.mockResolvedValue([]);

      const result = await service.listarUsuarios();

      expect(result).toEqual([]);
      expect(mockRepository.listarUsuarios).toHaveBeenCalled();
    });
  });

  describe("UserService - removerUsuario", () => {
    it("deve remover usuário com sucesso", async () => {
      mockRepository.buscarPorId.mockResolvedValue({
        id: "1",
        ...validDto,
      } as any);
      mockRepository.removerUsuario.mockResolvedValue(undefined);

      await service.removerUsuario("1");

      expect(mockRepository.buscarPorId).toHaveBeenCalledWith("1");
      expect(mockRepository.removerUsuario).toHaveBeenCalledWith("1");
    });

    it("deve lançar erro se ID não for informado", async () => {
      await expect(service.removerUsuario("")).rejects.toMatchObject({
        message: "O ID do usuário é obrigatório.",
        statusCode: 400,
      });
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.removerUsuario("999")).rejects.toMatchObject({
        message: "Usuário não encontrado para remoção.",
        statusCode: 404,
      });
    });
  });
});
