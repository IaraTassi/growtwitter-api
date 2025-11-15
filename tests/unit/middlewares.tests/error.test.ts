import { errorHandler } from "../../../src/middlewares/error.handler.middleware";

describe("Middleware - errorHandler", () => {
  const mockRes: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockReq: any = {};
  const mockNext = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("deve retornar erro com status e mensagem personalizados", () => {
    const error = { statusCode: 400, ok: false, message: "Erro de validação" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      ok: false,
      message: "Erro de validação",
    });
  });

  it("deve retornar erro genérico se não houver status nem mensagem", () => {
    errorHandler({}, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      ok: false,
      message: "Erro interno do servidor.",
    });
  });
});
