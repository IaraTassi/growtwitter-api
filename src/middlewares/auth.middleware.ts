import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
      status: 401,
      message: "Token de autenticação não fornecido ou inválido.",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next({ status: 500, message: "Erro interno de autenticação." });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.id;
    next();
  } catch (err) {
    next({ status: 401, message: "Token inválido ou expirado." });
  }
};
