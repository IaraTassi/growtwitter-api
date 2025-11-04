import { Response, NextFunction } from "express";
import { TweetService } from "../services/tweet.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const tweetService = new TweetService();

export class TweetController {
  async criarTweet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { content } = req.body;

      const tweet = await tweetService.criarTweet({ content }, userId!);

      return res.status(201).json({
        ok: true,
        message: "Tweet criado com sucesso.",
        tweet,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async criarReply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { content } = req.body;
      const { parentId } = req.params;

      if (!parentId) {
        return res
          .status(400)
          .json({ erro: "O ID do tweet original é obrigatório." });
      }

      const reply = await tweetService.criarReply(
        { content, parentId },
        userId!
      );

      return res.status(201).json({
        ok: true,
        message: "Resposta criada com sucesso.",
        reply,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async buscarFeedUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const feed = await tweetService.buscarFeedUsuario(userId);

      return res.status(200).json({
        ok: true,
        feed,
      });
    } catch (error) {
      next(error);
    }
  }
}
