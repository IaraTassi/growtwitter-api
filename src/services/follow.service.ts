import { FollowDto } from "../dtos/follow.dto";
import { Follow } from "../interfaces/follow.interface";
import { FollowRepository } from "../repositories/follow.repository";

export class FollowService {
  private followRepository = new FollowRepository();

  public setRepositoryParaTestes(repo: FollowRepository): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "setRepositoryParaTestes só pode ser usado em ambiente de teste."
      );
    }
    this.followRepository = repo;
  }

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new Error(mensagem);
  }

  async buscarFollow(
    followerId: string,
    followingId: string
  ): Promise<Follow | null> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(followingId, "O ID do usuário seguido é obrigatório.");

    return this.followRepository.buscarFollow(followerId, followingId);
  }

  async seguirUsuario(dto: FollowDto, followerId: string): Promise<Follow> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(
      dto.followingId,
      "O ID do usuário a ser seguido é obrigatório."
    );

    if (followerId === dto.followingId)
      throw new Error("Um usuário não pode seguir a si mesmo.");

    const relacionamentoExistente = await this.followRepository.buscarFollow(
      followerId,
      dto.followingId
    );
    if (relacionamentoExistente)
      throw new Error("O usuário já está seguindo este perfil.");

    const follow = await this.followRepository.seguirUsuario(dto, followerId);
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
      throw new Error("Um usuário não pode deixar de seguir a si mesmo.");

    const relacionamentoExistente = await this.followRepository.buscarFollow(
      followerId,
      followingId
    );
    if (!relacionamentoExistente)
      throw new Error("O usuário não segue este perfil.");

    await this.followRepository.deixarDeSeguirUsuario(followerId, followingId);
  }
}
