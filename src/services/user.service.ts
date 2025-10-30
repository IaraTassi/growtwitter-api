import { CreateUserDto } from "../dtos/create.user.dto";
import { User } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";
import { UserLoginDto } from "../dtos/user.login.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    if (!valor?.trim()) throw new Error(mensagem);
  }

  private async criarUsuario(dto: CreateUserDto): Promise<User> {
    this.validarCampo(dto.name, "O nome é obrigatório.");
    this.validarCampo(dto.userName, "O nome de usuário é obrigatório.");
    this.validarCampo(dto.email, "O email é obrigatório.");
    this.validarCampo(dto.password, "A senha é obrigatória.");

    const usuarioExistente = await this.userRepository.buscarPorIdentificador(
      dto.userName
    );
    if (usuarioExistente) throw new Error("O nome de usuário já está em uso.");

    const emailExistente = await this.userRepository.buscarPorIdentificador(
      dto.email
    );
    if (emailExistente) throw new Error("O email já está em uso.");

    return this.userRepository.criarUsuario(dto);
  }

  async registrar(dto: CreateUserDto): Promise<User> {
    this.validarCampo(dto.password, "A senha é obrigatória.");

    const senhaCriptografada = await bcrypt.hash(dto.password, 8);

    return this.criarUsuario({
      ...dto,
      password: senhaCriptografada,
    });
  }

  async buscarPorId(id: string): Promise<User | null> {
    this.validarCampo(id, "O ID do usuário é obrigatório.");
    return this.userRepository.buscarPorId(id);
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
    if (!user) throw new Error("Usuário não encontrado.");

    const senhaValida = await bcrypt.compare(dto.password, user.password);
    if (!senhaValida) throw new Error("Senha incorreta.");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado no ambiente.");

    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    const { password, ...userSemSenha } = user;

    return { user: userSemSenha, token };
  }
}
