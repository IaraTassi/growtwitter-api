import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next({
      statusCode: 401,
      ok: false,
      message: "Token de autenticação não fornecido ou inválido.",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next({
      statusCode: 500,
      ok: false,
      message: "Erro interno de autenticação.",
    });
  }

  try {
    const payload = jwt.verify(token, secret) as { id?: string };

    if (!payload.id) {
      return next({
        statusCode: 401,
        ok: false,
        message: "Usuário não encontrado no token.",
      });
    }

    req.userId = payload.id;
    next();
  } catch (err) {
    next({
      statusCode: 401,
      ok: false,
      message: "Token inválido ou expirado.",
    });
  }
};
