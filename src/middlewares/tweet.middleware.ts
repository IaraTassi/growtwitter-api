import { Request, Response, NextFunction } from "express";

export const validarCamposTweet = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const content = req.body.content || req.body.conteudo;

  if (!content || typeof content !== "string" || !content.trim()) {
    return next({
      statusCode: 400,
      ok: false,
      message: "O conteúdo do tweet é obrigatório.",
    });
  }

  if (content.trim().length > 280) {
    return next({
      statusCode: 400,
      ok: false,
      message: "O tweet não pode ter mais de 280 caracteres.",
    });
  }

  req.body.content = content.trim();
  next();
};

export const validarCamposReply = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const content = req.body.content;

  if (!content || typeof content !== "string" || !content.trim()) {
    return next({
      statusCode: 400,
      ok: false,
      message: "O conteúdo da resposta é obrigatório.",
    });
  }

  if (content.trim().length > 280) {
    return next({
      statusCode: 400,
      ok: false,
      message: "A resposta não pode ter mais de 280 caracteres.",
    });
  }

  req.body.content = content.trim();
  next();
};
