import { authMiddleware } from "./../middlewares/auth.middleware";
import { Router } from "express";
import { FollowController } from "../controllers/follow.controller";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";
import { validarCamposFollow } from "../middlewares/follow.middleware";

/**
 * ROTAS DE FOLLOW
 * -------------
 * GET     /:userId          → buscarFollow()
 * POST    /:userId          → seguirUsuario()
 * DELETE  /:userId          → deixarDeSeguirUsuario()
 */

const followRoutes = Router();
const followController = new FollowController();

followRoutes.get(
  "/:userId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => followController.buscarFollow(req, res, next)
);
followRoutes.post(
  "/:userId",
  authMiddleware,
  validarCamposFollow,
  validateUUIDParams,
  (req, res, next) => followController.seguirUsuario(req, res, next)
);
followRoutes.delete(
  "/:userId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => followController.deixarDeSeguirUsuario(req, res, next)
);

export default followRoutes;
