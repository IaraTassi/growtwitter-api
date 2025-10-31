import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";

export const validarCamposFollow = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { seguidorId, seguindoId } = req.body;

  if (!seguidorId?.trim() || !seguindoId?.trim()) {
    return res
      .status(400)
      .json({ erro: "Os campos seguidorId e seguindoId são obrigatórios." });
  }

  seguidorId = seguidorId.trim();
  seguindoId = seguindoId.trim();

  if (!isUUID(seguidorId) || !isUUID(seguindoId)) {
    return res.status(400).json({ erro: "Os IDs devem ser UUIDs válidos." });
  }

  req.body.seguidorId = seguidorId;
  req.body.seguindoId = seguindoId;

  next();
};
