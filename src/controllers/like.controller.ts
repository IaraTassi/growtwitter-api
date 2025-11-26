import { Response, NextFunction } from "express";
import { LikeService } from "../services/like.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const likeService = new LikeService();

export class LikeController {
  async adicionarLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tweetId } = req.params;
      const like = await likeService.adicionarLike({ tweetId }, userId);

      return res.status(201).json({
        ok: true,
        message: "Like adicionado com sucesso.",
        like,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async buscarLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tweetId } = req.params;
      const like = await likeService.buscarLike(tweetId, userId);

      return res.status(200).json({
        ok: true,
        message: like ? "Like buscado com sucesso." : "Nenhum like encontrado.",
        like,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async removerLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tweetId } = req.params;
      await likeService.removerLike(tweetId, userId);

      return res.status(200).json({
        ok: true,
        message: "Like removido com sucesso.",
      });
    } catch (error: any) {
      next(error);
    }
  }

  async alternarLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tweetId } = req.params;

      const result = await likeService.alternarLike(tweetId, userId);

      return res.status(200).json({
        ok: true,
        message: result
          ? "Like adicionado com sucesso."
          : "Like removido com sucesso.",
        like: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
