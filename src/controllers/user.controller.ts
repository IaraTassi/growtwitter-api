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
    } catch (error: any) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await userService.buscarPorId(userId);

      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "Usuário não encontrado.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Usuário encontrado com sucesso.",
        user,
      });
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      if (
        error.message?.includes("Senha") ||
        error.message?.includes("Usuário")
      ) {
        return res.status(401).json({ ok: false, message: error.message });
      }
      next(error);
    }
  }
}
