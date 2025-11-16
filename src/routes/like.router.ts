import { authMiddleware } from "./../middlewares/auth.middleware";
import { Router } from "express";
import { LikeController } from "../controllers/like.controller";
import { validarCamposLike } from "../middlewares/like.middleware";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";

/**
 * ROTAS DE LIKE
 * -------------
 * POST    /:tweetid               → adicionarLike()
 * GET     /:tweetId               → buscarLike()
 * DELETE  /:tweetId               → removerLike()
 */

const likeRoutes = Router();
const likeController = new LikeController();

likeRoutes.post(
  "/:tweetId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => likeController.adicionarLike(req, res, next)
);

likeRoutes.get(
  "/:tweetId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => likeController.buscarLike(req, res, next)
);

likeRoutes.delete(
  "/:tweetId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => likeController.removerLike(req, res, next)
);

export default likeRoutes;
