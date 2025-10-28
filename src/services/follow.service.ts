import { FollowDto } from "../dtos/follow.dto";
import { Follow } from "../interfaces/follow.interface";
import { FollowRepository } from "../repositories/follow.repository";

export class FollowService {
  private followRepository = new FollowRepository();

  private validarCampo(valor: string | undefined, mensagem: string) {
    if (!valor?.trim()) throw new Error(mensagem);
  }

  async seguirUsuario(dto: FollowDto, followerId: string): Promise<Follow> {
    this.validarCampo(followerId, "O ID do seguidor é obrigatório.");
    this.validarCampo(
      dto.followingId,
      "O ID do usuário a ser seguido é obrigatório."
    );

    if (followerId === dto.followingId)
      throw new Error("Um usuário não pode seguir a si mesmo.");

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

    await this.followRepository.deixarDeSeguirUsuario(followerId, followingId);
  }
}
