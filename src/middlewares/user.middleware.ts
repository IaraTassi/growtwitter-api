import { Request, Response, NextFunction } from "express";

export const validarCamposUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, userName, email, password } = req.body;

  if (!name?.trim())
    return next({
      status: 400,
      ok: false,
      message: "O campo nome é obrigatório.",
    });
  if (!userName?.trim())
    return next({
      status: 400,
      ok: false,
      message: "O campo nome de usuário é obrigatório.",
    });
  if (!email?.trim())
    return next({
      status: 400,
      ok: false,
      message: "O campo email é obrigatório.",
    });
  if (!password?.trim() || password.length < 6)
    return next({
      status: 400,
      ok: false,
      message: "A senha é obrigatória e deve ter pelo menos 6 caracteres.",
    });

  req.body = {
    ...req.body,
    name: name.trim(),
    userName: userName.trim(),
    email: email.trim(),
    password: password.trim(),
  };

  next();
};

export const validarCamposLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { identifier, password } = req.body;

  if (!identifier?.trim())
    return next({
      statusCode: 400,
      ok: false,
      message: "O campo 'identifier' é obrigatório.",
    });
  if (!password?.trim())
    return next({
      statusCode: 400,
      ok: false,
      message: "O campo 'password' é obrigatório.",
    });

  req.body.identifier = identifier.trim();
  req.body.password = password.trim();

  next();
};
