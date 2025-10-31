import { Request, Response, NextFunction } from "express";

export const validateUUIDParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  try {
    for (const key in req.params) {
      const rawValue = req.params[key];

      if (typeof rawValue === "string") {
        const value = rawValue.trim();

        if (!uuidRegex.test(value)) {
          throw {
            status: 400,
            message: `O parâmetro "${key}" é inválido ou ausente. Deve ser um UUID válido.`,
          };
        }
      }
    }

    next();
  } catch (err: any) {
    next(err);
  }
};
