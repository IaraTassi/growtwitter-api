import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4, validate as isUUID } from "uuid";

export const validarCamposLike = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tweetId = req.params.tweetId?.trim();

  if (!tweetId)
    return next({
      statusCode: 400,
      ok: false,
      message: "O ID do tweet é obrigatório.",
    });
  if (!isUUID(tweetId))
    return next({
      statusCode: 400,
      ok: false,
      message: "O ID do tweet deve ser um UUID válido.",
    });

  req.params.tweetId = tweetId;
  next();
};
