import { AppError } from "./app.error";

export class ConflictError extends AppError {
  constructor(message = "Conflito de dados.") {
    super(message, 409);
  }
}
