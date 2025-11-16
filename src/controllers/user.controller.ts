import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async criarUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.registrar(req.body);

      return res.status(201).json({
        ok: true,
        message: "Usuário criado com sucesso.",
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await userService.buscarPorId(userId);

      return res.status(200).json({
        ok: true,
        message: "Usuário encontrado com sucesso.",
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.listarUsuarios();

      return res.status(200).json({
        ok: true,
        message: "Lista de usuários obtida com sucesso.",
        users,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      const { user, token } = await userService.login({ identifier, password });

      return res.status(200).json({
        ok: true,
        message: "Login realizado com sucesso.",
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  async removerUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      await userService.removerUsuario(userId);

      return res.status(200).json({
        ok: true,
        message: "Usuário removido com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  }
}
