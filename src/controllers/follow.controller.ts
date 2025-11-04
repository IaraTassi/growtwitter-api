import { Response, NextFunction } from "express";
import { FollowService } from "../services/follow.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const followService = new FollowService();

export class FollowController {
  async buscarFollow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const followerId = req.userId!;
      const { userId: followingId } = req.params;

      if (!followingId) {
        return res.status(400).json({ erro: "ID do usuário é obrigatório." });
      }

      const follow = await followService.buscarFollow(followerId, followingId);
      return res.status(200).json({
        ok: true,
        message: "Follow buscado com sucesso.",
        follow,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async seguirUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const followerId = req.userId!;
      const { userId: followingId } = req.params;

      if (!followingId) {
        return res.status(400).json({
          erro: "ID do usuário é obrigatório.",
        });
      }

      const dto = { followingId };
      const follow = await followService.seguirUsuario(dto, followerId);

      return res.status(201).json({
        ok: true,
        message: "Usuário seguido com sucesso.",
        follow,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deixarDeSeguirUsuario(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const followerId = req.userId!;
      const { userId: followingId } = req.params;

      if (!followingId) {
        return res.status(400).json({ erro: "ID do usuário é obrigatório." });
      }

      await followService.deixarDeSeguirUsuario(followerId, followingId);
      return res.status(200).json({
        ok: true,
        message: "Usuário não está mais sendo seguido.",
      });
    } catch (error: any) {
      next(error);
    }
  }
}
