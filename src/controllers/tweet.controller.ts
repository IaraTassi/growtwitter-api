import { Request, Response, NextFunction } from "express";
import { TweetService } from "../services/tweet.service";

const tweetService = new TweetService();

export class TweetController {
  async criarTweet(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, content } = req.body;
      const tweet = await tweetService.criarTweet({ content }, userId);
      return res.status(201).json({
        ok: true,
        message: "Tweet criado com sucesso.",
        tweet,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async criarReply(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, content, parentId } = req.body;
      const reply = await tweetService.criarReply(
        { content, parentId },
        userId
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

  async buscarFeedUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const feed = await tweetService.buscarFeedUsuario(userId);
      return res.status(200).json({
        ok: true,
        message: "Feed buscado com sucesso.",
        feed,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
