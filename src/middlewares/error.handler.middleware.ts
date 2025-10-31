import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  const status = err.status || 500;
  const mensagem = err.message || "Erro interno do servidor";
  res.status(status).json({ erro: mensagem });
};
