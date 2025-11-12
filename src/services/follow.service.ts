import { FollowDto } from "../dtos/follow.dto";
import { Follow } from "../interfaces/follow.interface";
import { FollowRepository } from "../repositories/follow.repository";
import { AppError } from "../errors/app.error";
import { UserRepository } from "../repositories/user.repository";

export class FollowService {
  private followRepository: FollowRepository;
  private userRepository: UserRepository;

  constructor() {
    this.followRepository = new FollowRepository();
    this.userRepository = new UserRepository();
  }

  public setRepositoryParaTestes(
    followRepo: FollowRepository,
    userRepo: UserRepository
  ): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "setRepositoryParaTestes só pode ser usado em ambiente de teste."
      );
    }
    this.followRepository = followRepo;
    this.userRepository = userRepo;
  }

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new AppError(mensagem, 400);
  }

  async seguirUsuario(dto: FollowDto, followerId: string): Promise<Follow> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(
      dto.followingId,
      "O ID do usuário a ser seguido é obrigatório."
    );

    if (followerId === dto.followingId)
      throw new AppError("Um usuário não pode seguir a si mesmo.", 409);

    const usuarioExistente = await this.userRepository.buscarPorId(
      dto.followingId
    );
    if (!usuarioExistente) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const relacionamentoExistente = await this.followRepository.buscarFollow(
      followerId,
      dto.followingId
    );

    if (relacionamentoExistente)
      throw new AppError("O usuário já está seguindo este perfil.", 400);

    return await this.followRepository.seguirUsuario(
      followerId,
      dto.followingId
    );
  }

  async buscarFollow(
    followerId: string,
    followingId: string
  ): Promise<Follow | null> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(followingId, "O ID do usuário seguido é obrigatório.");

    const follow = await this.followRepository.buscarFollow(
      followerId,
      followingId
    );

    if (!follow) throw new AppError("Follow não encontrado.", 404);

    return follow;
  }

  async deixarDeSeguirUsuario(
    followerId: string,
    followingId: string
  ): Promise<void> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(
      followingId,
      "O ID do usuário a ser deixado de seguir é obrigatório."
    );

    if (followerId === followingId)
      throw new AppError("Um usuário não pode seguir a si mesmo.", 409);

    const relacionamentoExistente = await this.followRepository.buscarFollow(
      followerId,
      followingId
    );

    if (!relacionamentoExistente)
      throw new AppError("O usuário não segue este perfil.", 404);

    await this.followRepository.deixarDeSeguirUsuario(followerId, followingId);
  }
}
