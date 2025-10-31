import {
  authMiddleware,
  AuthRequest,
} from "../../../src/middlewares/auth.middleware";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = "supersecret";
    jest.clearAllMocks();
  });

  it("deve retornar erro se o token não for fornecido", () => {
    authMiddleware(req as AuthRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith({
      status: 401,
      message: "Token de autenticação não fornecido ou inválido.",
    });
  });

  it("deve retornar erro se o JWT_SECRET não estiver definido", () => {
    delete process.env.JWT_SECRET;
    req.headers = { authorization: "Bearer token123" };

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith({
      status: 500,
      message: "Erro interno de autenticação.",
    });
  });

  it("deve chamar next() se o token for válido", () => {
    req.headers = { authorization: "Bearer validtoken" };
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(req.userId).toBe("user123");
    expect(next).toHaveBeenCalled();
  });

  it("deve retornar erro se o token for inválido", () => {
    req.headers = { authorization: "Bearer invalidtoken" };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith({
      status: 401,
      message: "Token inválido ou expirado.",
    });
  });
});
