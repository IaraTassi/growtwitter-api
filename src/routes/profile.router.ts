import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";

/**
 * ROTAS DE PROFILE
 * -------------
 * GET      /:userId/tweets             → getProfileTweets()
 * GET      /:userId/replies            → getProfileReplies()
 * GET      /:userId/likes              → getProfileLikes()
 */

const profileController = new ProfileController();
const profileRoutes = Router();

profileRoutes.get(
  "/:userId/tweets",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => {
    profileController.getProfileTweets(req, res, next);
  },
);

profileRoutes.get(
  "/:userId/replies",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => {
    profileController.getProfileReplies(req, res, next);
  },
);

profileRoutes.get(
  "/:userId/likes",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => {
    profileController.getProfileLikes(req, res, next);
  },
);

export default profileRoutes;
