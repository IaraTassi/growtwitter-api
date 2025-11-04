import { authMiddleware } from "./../middlewares/auth.middleware";
import { Router } from "express";
import { TweetController } from "../controllers/tweet.controller";
import { validarCamposTweet } from "../middlewares/tweet.middleware";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";

/**
 * ROTAS DE TWEET
 * -------------
 * POST   /                       → criarTweet()
 * POST   /:parentId/reply        → criarReply()
 * GET    /feed                   → buscarFeedUsuario()
 */

const tweetRoutes = Router();
const tweetController = new TweetController();

tweetRoutes.post("/", authMiddleware, validarCamposTweet, (req, res, next) =>
  tweetController.criarTweet(req, res, next)
);
tweetRoutes.post(
  "/:parentId/reply",
  authMiddleware,
  validarCamposTweet,
  (req, res, next) => tweetController.criarReply(req, res, next)
);
tweetRoutes.get("/feed", authMiddleware, (req, res, next) =>
  tweetController.buscarFeedUsuario(req, res, next)
);

export default tweetRoutes;
