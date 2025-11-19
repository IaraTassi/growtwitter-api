import { CreateUserDto } from "../dtos/create.user.dto";
import { User } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";
import { UserLoginDto } from "../dtos/user.login.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app.error";

export class UserService {
  private userRepository = new UserRepository();

  public setRepositoryParaTestes(repo: UserRepository): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "setRepositoryParaTestes só pode ser usado em ambiente de teste."
      );
    }
    this.userRepository = repo;
  }

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new AppError(mensagem, 400);
  }

  private validarEmail(email: string) {
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(email)) throw new AppError("Email inválido.", 400);
  }

  private validarImageUrl(url?: string) {
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      throw new AppError("A URL da imagem é inválida.", 400);
    }
  }

  private async criarUsuario(dto: CreateUserDto): Promise<User> {
    this.validarCampo(dto.name, "O nome é obrigatório.");
    this.validarCampo(dto.userName, "O nome de usuário é obrigatório.");
    this.validarCampo(dto.email, "O email é obrigatório.");
    this.validarCampo(dto.password, "A senha é obrigatória.");
    this.validarImageUrl(dto.imageUrl);

    if (dto.password.length < 6)
      throw new AppError("A senha deve ter pelo menos 6 caracteres.", 400);
    this.validarEmail(dto.email);

    const usuarioExistente = await this.userRepository.buscarPorIdentificador(
      dto.userName
    );
    if (usuarioExistente)
      throw new AppError("O nome de usuário já está em uso.", 409);

    const emailExistente = await this.userRepository.buscarPorIdentificador(
      dto.email
    );
    if (emailExistente) throw new AppError("O email já está em uso.", 409);

    return this.userRepository.criarUsuario(dto);
  }

  async registrar(dto: CreateUserDto): Promise<User> {
    this.validarCampo(dto.password, "A senha é obrigatória.");
    this.validarCampo(dto.email, "O email é obrigatório.");

    if (dto.password.length < 6)
      throw new AppError("A senha deve ter pelo menos 6 caracteres.", 400);
    this.validarEmail(dto.email);

    const senhaCriptografada = await bcrypt.hash(dto.password, 8);

    return this.criarUsuario({ ...dto, password: senhaCriptografada });
  }

  async buscarPorId(id: string): Promise<User> {
    this.validarCampo(id, "O ID do usuário é obrigatório.");

    const user = await this.userRepository.buscarPorId(id);
    if (!user) throw new AppError("Usuário não encontrado.", 404);

    return user;
  }

  async login(
    dto: UserLoginDto
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    this.validarCampo(
      dto.identifier,
      "O identificador usuário ou email é obrigatório."
    );
    this.validarCampo(dto.password, "A senha é obrigatória.");

    const user = await this.userRepository.buscarPorIdentificador(
      dto.identifier
    );
    if (!user) throw new AppError("Usuário não encontrado.", 404);

    const senhaValida = await bcrypt.compare(dto.password, user.password);
    if (!senhaValida) throw new AppError("Senha incorreta.", 401);

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new AppError("JWT_SECRET não configurado no ambiente.", 500);

    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    const { password, ...userSemSenha } = user;
    return { user: userSemSenha, token };
  }

  async listarUsuarios(): Promise<User[]> {
    const users = await this.userRepository.listarUsuarios();
    return users ?? [];
  }

  async removerUsuario(id: string): Promise<void> {
    this.validarCampo(id, "O ID do usuário é obrigatório.");

    const userExistente = await this.userRepository.buscarPorId(id);
    if (!userExistente)
      throw new AppError("Usuário não encontrado para remoção.", 404);

    await this.userRepository.removerUsuario(id);
  }
}
