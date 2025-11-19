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

  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tweet = await tweetService.buscarPorId(id);

      return res.status(200).json({
        ok: true,
        tweet,
        message: "Tweet buscado com sucesso.",
      });
    } catch (err) {
      next(err);
    }
  }

  async criarReply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { content } = req.body;
      const { parentId } = req.params;
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
        message: "Feed buscado com sucesso.",
        feed,
      });
    } catch (error) {
      next(error);
    }
  }
}
