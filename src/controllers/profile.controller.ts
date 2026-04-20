import { Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const profileService = new ProfileService();

export class ProfileController {
  async getProfileTweets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const tweets = await profileService.getProfileTweets(userId, req.userId!);

      return res.status(200).json({
        ok: true,
        message: "Tweets do perfil buscados com sucesso.",
        tweets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileReplies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const replies = await profileService.getProfileReplies(
        userId,
        req.userId!,
      );

      return res.status(200).json({
        ok: true,
        message: "Replies do perfil buscadas com sucesso.",
        replies,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileLikes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const likes = await profileService.getProfileLikes(userId, req.userId!);

      return res.status(200).json({
        ok: true,
        message: "Likes do perfil buscados com sucesso.",
        likes,
      });
    } catch (error) {
      next(error);
    }
  }
}
