import { authMiddleware } from "./../middlewares/auth.middleware";
import { Router } from "express";
import { LikeController } from "../controllers/like.controller";
import { validarCamposLike } from "../middlewares/like.middleware";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";

/**
 * ROTAS DE LIKE
 * -------------
 * GET     /:tweetId                → buscarLike()
 * POST    /:tweetid               → adicionarLike()
 * DELETE  /:tweetId               → removerLike()
 */

const likeRoutes = Router();
const likeController = new LikeController();

likeRoutes.get(
  "/:tweetId",
  authMiddleware,
  validarCamposLike,
  (req, res, next) => likeController.buscarLike(req, res, next)
);
likeRoutes.post(
  "/:tweetId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => likeController.adicionarLike(req, res, next)
);
likeRoutes.delete("/:tweetId", authMiddleware, (req, res, next) =>
  likeController.removerLike(req, res, next)
);

export default likeRoutes;
