import { NextFunction, Request, Response } from "express";
import { LikeService } from "../services/like.service";

const likeService = new LikeService();

export class LikeController {
  async adicionarLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { tweetId } = req.params;
      const { userId } = req.body;
      const like = await likeService.adicionarLike({ tweetId }, userId);
      return res.status(200).json({
        ok: true,
        message: "Like adicionado com sucesso.",
        like,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async removerLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { tweetId } = req.params;
      const { userId } = req.body;
      const result = await likeService.removerLike(tweetId, userId);
      return res.status(200).json({
        ok: true,
        message: "Like removido com sucesso.",
        result,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
