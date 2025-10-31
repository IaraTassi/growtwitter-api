import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";

export const validarCamposLike = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tweetId = req.params.tweetId?.trim();

  if (!tweetId) {
    return res.status(400).json({ erro: "O ID do tweet é obrigatório." });
  }

  if (!isUUID(tweetId)) {
    return res
      .status(400)
      .json({ erro: "O ID do tweet deve ser um UUID válido." });
  }

  req.params.tweetId = tweetId;
  next();
};
