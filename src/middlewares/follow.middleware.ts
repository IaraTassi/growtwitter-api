import { Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";
import { AuthRequest } from "./auth.middleware";

export const validarCamposFollow = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const followerId = req.userId?.trim();
  const followingId = req.params.userId?.trim();

  if (!followerId || !followingId) {
    return res.status(400).json({
      erro: "Os IDs do seguidor e do usuário a seguir são obrigatórios.",
    });
  }

  if (!isUUID(followerId) || !isUUID(followingId)) {
    return res.status(400).json({ erro: "Os IDs devem ser UUIDs válidos." });
  }

  next();
};
