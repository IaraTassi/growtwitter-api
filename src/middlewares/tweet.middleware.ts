import { Request, Response, NextFunction } from "express";

export const validarCamposTweet = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const content = req.body.content || req.body.conteudo;

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ erro: "O conteúdo do tweet é obrigatório." });
  }

  const trimContent = content.trim();
  if (trimContent.length > 280) {
    return res
      .status(400)
      .json({ erro: "O tweet não pode ter mais de 280 caracteres." });
  }

  req.body.content = trimContent;
  next();
};
