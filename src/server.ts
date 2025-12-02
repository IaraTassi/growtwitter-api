import * as dotenv from "dotenv";
dotenv.config();

console.log("JWT_SECRET definida?", !!process.env.JWT_SECRET);
console.log("DATABASE_URL definida?", !!process.env.DATABASE_URL);

import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
