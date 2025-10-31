import { Request, Response, NextFunction } from "express";

export async function validarCamposUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { name, userName, email, password } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ erro: "O campo nome é obrigatório." });
  }
  if (!userName?.trim()) {
    return res
      .status(400)
      .json({ erro: "O campo nome de usuário é obrigatório." });
  }
  if (!email?.trim()) {
    return res.status(400).json({ erro: "O campo email é obrigatório." });
  }
  if (!password?.trim() || password.length < 6) {
    return res.status(400).json({
      erro: "A senha é obrigatória e deve ter pelo menos 6 caracteres.",
    });
  }

  req.body = {
    ...req.body,
    name: name.trim(),
    userName: userName.trim(),
    email: email.trim(),
    password: password.trim(),
  };

  next();
}

export const validarCamposLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { identifier, password } = req.body as {
    identifier?: string;
    password?: string;
  };

  if (!identifier?.trim()) {
    return res
      .status(400)
      .json({ erro: "O campo 'identifier' é obrigatório." });
  }

  if (!password?.trim()) {
    return res.status(400).json({ erro: "O campo 'password' é obrigatório." });
  }

  req.body = {
    ...req.body,
    identifier: identifier.trim(),
    password: password.trim(),
  };

  next();
};
