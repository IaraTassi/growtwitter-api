import { validateUUIDParams } from "../../../src/middlewares/validate.UUID.middleware";

describe("Middleware - validateUUIDParams", () => {
  const mockRes: any = {};
  const mockNext = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("deve chamar next() se o UUID for válido", () => {
    const mockReq: any = {
      params: { id: "123e4567-e89b-12d3-a456-426614174000" },
    };
    validateUUIDParams(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("deve retornar erro se o UUID for inválido", () => {
    const mockReq: any = { params: { id: "1234" } };
    validateUUIDParams(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith({
      statusCode: 400,
      ok: false,
      message:
        'O parâmetro "id" é inválido ou ausente. Deve ser um UUID válido.',
    });
  });

  it("deve validar múltiplos parâmetros UUID válidos", () => {
    const mockReq: any = {
      params: {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        postId: "223e4567-e89b-12d3-a456-426614174111",
      },
    };
    validateUUIDParams(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("deve retornar erro se o parâmetro estiver vazio", () => {
    const mockReq: any = { params: { id: "   " } };
    validateUUIDParams(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith({
      statusCode: 400,
      ok: false,
      message:
        'O parâmetro "id" é inválido ou ausente. Deve ser um UUID válido.',
    });
  });
});
