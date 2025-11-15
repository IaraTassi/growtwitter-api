import { Response, NextFunction } from "express";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import { AuthRequest } from "./auth.middleware";

export const validarCamposFollow = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const followerId = req.userId?.trim();
  const followingId = req.params.userId?.trim();

  if (!followerId || !followingId)
    return next({
      statusCode: 400,
      ok: false,
      message: "Os IDs do seguidor e do usuário a seguir são obrigatórios.",
    });
  if (!isUUID(followerId) || !isUUID(followingId))
    return next({
      statusCode: 400,
      ok: false,
      message: "Os IDs devem ser UUIDs válidos.",
    });

  next();
};
