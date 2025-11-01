import { Request, Response, NextFunction } from "express";
import { FollowService } from "../services/follow.service";

const followService = new FollowService();

export class FollowController {
  async buscarFollow(req: Request, res: Response, next: NextFunction) {
    try {
      const { followerId, followingId } = req.params;
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

  async seguirUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { followingId } = req.params;
      const { followerId } = req.body;
      const follow = await followService.seguirUsuario(
        { followingId },
        followerId
      );
      return res.status(201).json({
        ok: true,
        message: "Usuário seguido com sucesso.",
        follow,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deixarDeSeguirUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { followingId } = req.params;
      const { followerId } = req.body;
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
