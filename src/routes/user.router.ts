import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  validarCamposLogin,
  validarCamposUser,
} from "../middlewares/user.middleware";
import { validateUUIDParams } from "../middlewares/validate.UUID.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

/**
 * ROTAS DE USER
 * -------------
 * POST     /                    → criarUsuario()
 * POST     /login               → login()
 * GET      /:userId             → buscarPorId()
 * GET      /                    → listarUsuarios()
 * DELETE   /:userId             → removerUsuaerio()
 */

const userController = new UserController();
const userRoutes = Router();

userRoutes.post("/", validarCamposUser, (req, res, next) =>
  userController.criarUsuario(req, res, next)
);
userRoutes.post("/login", validarCamposLogin, (req, res, next) =>
  userController.login(req, res, next)
);
userRoutes.get(
  "/:userId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => userController.buscarPorId(req, res, next)
);
userRoutes.get("/", (req, res, next) =>
  userController.listarUsuarios(req, res, next)
);
userRoutes.delete(
  "/:userId",
  authMiddleware,
  validateUUIDParams,
  (req, res, next) => userController.removerUsuario(req, res, next)
);

export default userRoutes;
