import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
